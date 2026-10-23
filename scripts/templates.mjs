/**
 * CSU-One page templates: compiles `src/pages/**\/*.html` into typed React
 * components under `src/generated/views/`. Page markup lives in the .html file,
 * page styling in the matching .css file, and behaviour (state, routing, event
 * handlers) in the page's .tsx controller, which renders the generated view.
 *
 * Template syntax (HTML with a few binding attributes):
 *   <template data-component="StudentHomeView"      root: component name
 *             data-from="./StudentHome"             module exporting the props type
 *             data-props-type="StudentHomeViewProps" (default: <component>Props)
 *             data-props="firstName reports onOpen"  props used by the template
 *             data-imports="AssignControl:./AssignControl">  page-local components
 *   {{ expr }}                 text interpolation; also inside attribute values
 *   :attr="expr"               bound attribute or component prop
 *   @click="expr"              event handler (click → onClick, keydown → onKeyDown, …)
 *   data-if / data-else-if / data-else   conditional rendering on sibling elements
 *   data-for="item in items"  or "(item, i) in items"   repeat (needs :key)
 *   <template data-slot="actions">…</template>   pass markup to a component prop
 *   <template>…</template>     grouping without an element
 *   <PageHeader …/>            shared components (src/templates/components.ts)
 *   <Icon.MapPin size="16" />  Lucide icons
 *
 * Generated files are build output: edit the .html file, never the generated .tsx.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { parseDocument } from 'htmlparser2'

const PAGES_DIR = 'src/pages'
const OUT_DIR = 'src/generated/views'
const REGISTRY = 'src/templates/components'

const DOM_ATTRS = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', maxlength: 'maxLength', minlength: 'minLength',
  autocomplete: 'autoComplete', autofocus: 'autoFocus', readonly: 'readOnly', colspan: 'colSpan', rowspan: 'rowSpan',
  spellcheck: 'spellCheck', inputmode: 'inputMode', autocapitalize: 'autoCapitalize', novalidate: 'noValidate',
  enterkeyhint: 'enterKeyHint', datetime: 'dateTime', crossorigin: 'crossOrigin', srcset: 'srcSet',
}
const EVENTS = {
  click: 'onClick', change: 'onChange', submit: 'onSubmit', input: 'onInput', blur: 'onBlur', focus: 'onFocus',
  keydown: 'onKeyDown', keyup: 'onKeyUp', mousedown: 'onMouseDown', mouseenter: 'onMouseEnter', mouseleave: 'onMouseLeave',
  pointerdown: 'onPointerDown', pointermove: 'onPointerMove', dblclick: 'onDoubleClick',
}
/** Attributes whose empty value means an empty string rather than boolean true */
const STRING_ATTRS = new Set(['alt', 'value', 'placeholder', 'title', 'label', 'href', 'src', 'class', 'name', 'id'])
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const DIRECTIVES = new Set(['data-if', 'data-else-if', 'data-else', 'data-for', 'data-slot'])

class TemplateError extends Error {}

const isComponent = (name) => /^[A-Z]/.test(name) || name.includes('.')
const isBlank = (n) => n.type === 'text' && n.data.trim() === ''
const elements = (nodes) => nodes.filter((n) => n.type === 'tag' || n.type === 'script' || n.type === 'style')
const posix = (p) => p.split(sep).join('/')
const relImport = (fromFile, toPath) => {
  let r = posix(relative(dirname(fromFile), toPath))
  if (!r.startsWith('.')) r = `./${r}`
  return r.replace(/\.(tsx?|mjs|js)$/, '')
}

/** Converts `text {{ expr }} more` into JSX children. */
function textToJsx(text, where, map = (s) => s) {
  let out = ''
  let i = 0
  while (i < text.length) {
    const open = text.indexOf('{{', i)
    const chunk = open === -1 ? text.slice(i) : text.slice(i, open)
    out += chunk.replace(/[{}>]/g, (c) => (c === '>' ? '&gt;' : `{'${c}'}`))
    if (open === -1) break
    const close = text.indexOf('}}', open + 2)
    if (close === -1) throw new TemplateError(`Unclosed {{ in ${where}`)
    out += `{${map(text.slice(open + 2, close).trim())}}`
    i = close + 2
  }
  return out
}

/** Static attribute value, possibly containing {{ }} → JSX attribute value. */
function attrValue(value, map = (s) => s) {
  if (value.includes('{{')) {
    let tpl = ''
    let i = 0
    while (i < value.length) {
      const open = value.indexOf('{{', i)
      const chunk = open === -1 ? value.slice(i) : value.slice(i, open)
      tpl += chunk.replace(/[`\\]/g, (c) => `\\${c}`).replace(/\$\{/g, '\\${')
      if (open === -1) break
      const close = value.indexOf('}}', open + 2)
      tpl += `\${${map(value.slice(open + 2, close).trim())}}`
      i = close + 2
    }
    return `{\`${tpl}\`}`
  }
  return value.includes('"') ? `{${JSON.stringify(value)}}` : `"${value}"`
}

function createCompiler(root, absFile, source) {
  const file = relative(root, absFile)
  const doc = parseDocument(source, {
    lowerCaseTags: false, lowerCaseAttributeNames: false, recognizeSelfClosing: true, decodeEntities: false, withStartIndices: true,
  })
  const lineOf = (node) => source.slice(0, node.startIndex ?? 0).split('\n').length
  const where = (node) => `${posix(file)}:${lineOf(node)}`
  const usedComponents = new Set()
  const usedIcons = new Set()
  let usesFragment = false
  /** Lets expressions reference Lucide icons as Icon.Name (e.g. :icon="Icon.ClipboardList"). */
  const expr = (code) => code.replace(/\bIcon\.([A-Z]\w*)/g, (_m, icon) => { usedIcons.add(icon); return `Icon_${icon}` })

  function tagName(node) {
    const name = node.name
    if (name.startsWith('Icon.')) { const icon = name.slice(5); usedIcons.add(icon); return `Icon_${icon}` }
    // Dotted names like <item.Icon> are components taken from template data, not imports.
    if (name.includes('.')) return name
    if (isComponent(name)) { usedComponents.add(name); return name }
    return name
  }

  function attrs(node, component) {
    const a = node.attribs
    const out = []
    const staticClass = a.class
    const boundClass = a[':class']
    if (staticClass !== undefined && boundClass !== undefined) out.push(`className={\`${staticClass} \${${expr(boundClass)}}\`}`)
    else if (boundClass !== undefined) out.push(`className={${expr(boundClass)}}`)
    else if (staticClass !== undefined) out.push(`className=${attrValue(staticClass, expr)}`)
    for (const [raw, value] of Object.entries(a)) {
      if (DIRECTIVES.has(raw) || raw === 'class' || raw === ':class') continue
      if (raw === 'style') throw new TemplateError(`Inline style is not allowed (${where(node)}); use the page .css file`)
      if (raw.startsWith('@')) {
        const ev = raw.slice(1)
        const prop = EVENTS[ev] ?? `on${ev.replace(/(^|-)(\w)/g, (_m, _d, c) => c.toUpperCase())}`
        out.push(`${prop}={${expr(value)}}`)
      } else if (raw.startsWith(':')) {
        const name = raw.slice(1)
        out.push(`${component ? name : DOM_ATTRS[name] ?? name}={${expr(value)}}`)
      } else {
        const name = component ? raw : DOM_ATTRS[raw] ?? raw
        if (value === '' && !STRING_ATTRS.has(raw)) out.push(name)
        else out.push(`${name}=${attrValue(value, expr)}`)
      }
    }
    return out
  }

  /** Children of an element, including data-if chains and slots. */
  function children(nodes, depth) {
    const parts = []
    let i = 0
    const list = nodes.filter((n) => n.type !== 'comment')
    while (i < list.length) {
      const node = list[i]
      if (node.type === 'text') {
        // Whitespace between elements of a conditional chain or at the edges is irrelevant to JSX.
        const jsx = textToJsx(node.data, where(node), expr)
        if (jsx.trim() !== '') parts.push(jsx)
        else if (jsx.includes('\n')) parts.push('\n')
        else parts.push(jsx)
        i++
        continue
      }
      if (node.attribs?.['data-slot'] !== undefined) { i++; continue }
      if (node.attribs?.['data-if'] !== undefined) {
        const chain = [node]
        let j = i + 1
        while (j < list.length) {
          if (isBlank(list[j])) { j++; continue }
          const next = list[j]
          if (next.type === 'tag' && (next.attribs['data-else-if'] !== undefined || next.attribs['data-else'] !== undefined)) {
            chain.push(next)
            j++
            if (next.attribs['data-else'] !== undefined) break
          } else break
        }
        parts.push(`{${conditional(chain, depth)}}`)
        i = j
        continue
      }
      if (node.attribs?.['data-else-if'] !== undefined || node.attribs?.['data-else'] !== undefined) {
        throw new TemplateError(`data-else without a preceding data-if (${where(node)})`)
      }
      parts.push(element(node, depth))
      i++
    }
    return parts.join('')
  }

  function conditional(chain, depth) {
    const [first, ...rest] = chain
    const cond = expr(first.attribs['data-if'] ?? first.attribs['data-else-if'])
    const yes = element(first, depth, true)
    if (!rest.length) return `(${cond}) && (${yes})`
    const next = rest[0]
    if (next.attribs['data-else'] !== undefined) return `(${cond}) ? (${yes}) : (${element(next, depth, true)})`
    return `(${cond}) ? (${yes}) : (${conditional(rest, depth)})`
  }

  function element(node, depth, inExpression = false) {
    if (node.type !== 'tag') throw new TemplateError(`Unsupported node <${node.name}> (${where(node)})`)
    const loop = node.attribs['data-for']
    if (loop !== undefined) {
      const m = loop.match(/^\s*(?:\(\s*([\w$]+)\s*,\s*([\w$]+)\s*\)|([\w$]+))\s+in\s+([\s\S]+)$/)
      if (!m) throw new TemplateError(`Invalid data-for "${loop}" (${where(node)})`)
      const item = m[1] ?? m[3]
      const index = m[2]
      const source = expr(m[4].trim())
      const clone = { ...node, attribs: { ...node.attribs } }
      delete clone.attribs['data-for']
      if (clone.attribs[':key'] === undefined) throw new TemplateError(`data-for needs :key (${where(node)})`)
      const body = render(clone, depth)
      const mapped = `(${source}).map((${item}${index ? `, ${index}` : ''}) => (${body}))`
      return inExpression ? mapped : `{${mapped}}`
    }
    return render(node, depth)
  }

  function render(node, depth) {
    if (node.name === 'template') {
      const key = node.attribs[':key']
      const inner = children(node.children, depth + 1)
      if (key !== undefined) { usesFragment = true; return `<Fragment key={${expr(key)}}>${inner}</Fragment>` }
      return `<>${inner}</>`
    }
    const component = isComponent(node.name)
    const name = tagName(node)
    const props = attrs(node, component)
    // Slots: <template data-slot="x"> children become the prop x={<>…</>}.
    if (component) {
      for (const child of node.children) {
        if (child.type === 'tag' && child.name === 'template' && child.attribs['data-slot'] !== undefined) {
          props.push(`${child.attribs['data-slot']}={<>${children(child.children, depth + 2)}</>}`)
        }
      }
    }
    const open = props.length ? `<${name} ${props.join(' ')}` : `<${name}`
    const kids = node.children.filter((c) => c.type !== 'comment' && !(c.type === 'tag' && c.attribs['data-slot'] !== undefined))
    if (VOID.has(name) || kids.every((c) => isBlank(c))) return `${open} />`
    return `${open}>${children(kids, depth + 1)}</${name}>`
  }

  return {
    compile(outFile) {
      const roots = elements(doc.children)
      const rootEl = roots.find((n) => n.name === 'template' && n.attribs['data-component'])
      if (!rootEl || roots.length !== 1) throw new TemplateError(`${posix(file)} must contain exactly one root <template data-component="…">`)
      const a = rootEl.attribs
      const component = a['data-component']
      const propNames = (a['data-props'] ?? '').split(/\s+/).filter(Boolean)
      const propsType = a['data-props-type'] ?? `${component}Props`
      const from = a['data-from']
      const local = Object.fromEntries((a['data-imports'] ?? '').split(/\s+/).filter(Boolean).map((pair) => {
        const [n, p] = pair.split(':')
        if (!n || !p) throw new TemplateError(`Invalid data-imports entry "${pair}" in ${posix(file)}`)
        return [n, p]
      }))
      const body = children(rootEl.children, 2).trim()

      const lines = [
        `// GENERATED from ${posix(file)} by scripts/templates.mjs. Do not edit: change the .html template instead.`,
      ]
      if (usesFragment) lines.push(`import { Fragment } from 'react'`)
      if (from) lines.push(`import type { ${propsType} } from '${relImport(outFile, resolve(dirname(absFile), from))}'`)
      const registryNames = [...usedComponents].filter((n) => !local[n]).sort()
      if (registryNames.length) lines.push(`import { ${registryNames.join(', ')} } from '${relImport(outFile, join(root, REGISTRY))}'`)
      for (const [n, p] of Object.entries(local)) {
        if (usedComponents.has(n)) lines.push(`import { ${n} } from '${relImport(outFile, resolve(dirname(absFile), p))}'`)
      }
      if (usedIcons.size) lines.push(`import { ${[...usedIcons].sort().map((i) => `${i} as Icon_${i}`).join(', ')} } from 'lucide-react'`)
      lines.push('')
      const signature = from ? `props: ${propsType}` : ''
      lines.push(`export function ${component}(${signature}) {`)
      if (propNames.length) lines.push(`  const { ${propNames.join(', ')} } = props`)
      lines.push(`  return (`, `    <>${body}</>`, `  )`, `}`, '')
      return lines.join('\n')
    },
  }
}

function findTemplates(root) {
  const dir = join(root, PAGES_DIR)
  const out = []
  const walk = (d) => {
    for (const name of readdirSync(d)) {
      const full = join(d, name)
      if (statSync(full).isDirectory()) walk(full)
      else if (name.endsWith('.html')) out.push(full)
    }
  }
  if (existsSync(dir)) walk(dir)
  return out
}

const outPathFor = (root, file) => join(root, OUT_DIR, relative(join(root, PAGES_DIR), file).replace(/\.html$/, '.tsx'))

/** Compiles one template; writes only when the output changed. Returns true when written. */
export function compileFile(root, file) {
  const outFile = outPathFor(root, file)
  const code = createCompiler(root, file, readFileSync(file, 'utf8')).compile(outFile)
  if (existsSync(outFile) && readFileSync(outFile, 'utf8') === code) return false
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, code)
  return true
}

/** Compiles every template and removes generated views whose template was deleted. */
export function compileAll(root = process.cwd()) {
  const files = findTemplates(root)
  const expected = new Set(files.map((f) => outPathFor(root, f)))
  for (const f of files) compileFile(root, f)
  const outRoot = join(root, OUT_DIR)
  const sweep = (d) => {
    if (!existsSync(d)) return
    for (const name of readdirSync(d)) {
      const full = join(d, name)
      if (statSync(full).isDirectory()) sweep(full)
      else if (!expected.has(full)) rmSync(full)
    }
  }
  sweep(outRoot)
  return { count: files.length }
}

/** Vite plugin: compile on start, recompile templates on change during development. */
export function csuTemplates() {
  let root = process.cwd()
  return {
    name: 'csu-one:templates',
    enforce: 'pre',
    configResolved(config) { root = config.root },
    buildStart() { compileAll(root) },
    configureServer(server) {
      const pagesDir = join(root, PAGES_DIR)
      const onChange = (file) => {
        if (!file.endsWith('.html') || !file.startsWith(pagesDir)) return
        try {
          compileFile(root, file)
        } catch (e) {
          server.config.logger.error(String(e.message ?? e))
          server.ws.send({ type: 'error', err: { message: String(e.message ?? e), stack: '' } })
        }
      }
      // Vite already watches the whole project, including src/pages/**/*.html.
      server.watcher.on('add', onChange)
      server.watcher.on('change', onChange)
      server.watcher.on('unlink', (file) => {
        if (file.endsWith('.html') && file.startsWith(pagesDir)) {
          const out = outPathFor(root, file)
          if (existsSync(out)) rmSync(out)
        }
      })
    },
  }
}

// CLI: `node scripts/templates.mjs`
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  try {
    const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
    const { count } = compileAll(root)
    console.log(`templates: compiled ${count} page template${count === 1 ? '' : 's'}`)
  } catch (e) {
    console.error(`templates: ${e instanceof TemplateError ? e.message : e.stack ?? e}`)
    process.exit(1)
  }
}
