/**
 * --------------------------------------------------------------------------
 * Bootstrap (v5.0.2): util/template-factory.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

import { DefaultAllowlist, sanitizeHtml } from './sanitizer'
import { getElement, isElement, typeCheckConfig } from '../util/index'
import SelectorEngine from '../dom/selector-engine'

const NAME = 'TemplateFactory'
const Default = {
  extraClass: '',
  template: '<div></div>',
  content: {}, // { selector : text ,  selector2 : text2 , }
  html: false,
  sanitize: true,
  sanitizeFn: null,
  allowList: DefaultAllowlist
}

const DefaultType = {
  extraClass: '(string|function)',
  template: 'string',
  content: 'object',
  html: 'boolean',
  sanitize: 'boolean',
  sanitizeFn: '(null|function)',
  allowList: 'object'
}
const DefaultContentType = {
  selector: '(string|element)',
  entry: '(string|element|function|null)'
}

class TemplateFactory {
  constructor(config) {
    this._config = this._getConfig(config)
  }

  // Getters

  static get NAME() {
    return NAME
  }

  static get Default() {
    return Default
  }

  // Public

  getContent() {
    return Object.values(this._config.content).map(this._resolvePossibleFunction).filter(Boolean)
  }

  changeContent(content) {
    this._config.content = content
    return this
  }

  hasContent() {
    return this.getContent().length > 0
  }

  toHtml() {
    const templateWrapper = document.createElement('div')
    templateWrapper.innerHTML = this._maybeSanitize(this._config.template)

    for (const [selector, text] of Object.entries(this._config.content)) {
      this._setContent(templateWrapper, text, selector)
    }

    const template = templateWrapper.children[0]
    const extraClass = this._resolvePossibleFunction(this._config.extraClass)
    if (extraClass) {
      template.classList.add(...extraClass.split(' '))
    }

    return template
  }

  // Private
  _getConfig(config) {
    config = {
      ...Default,
      ...(typeof config === 'object' ? config : {})
    }

    typeCheckConfig(NAME, config, DefaultType)

    for (const [selector, content] of Object.entries(config.content)) {
      typeCheckConfig(NAME, { selector, entry: content }, DefaultContentType)
    }

    return config
  }

  _setContent(template, content, selector) {
    const templateElement = SelectorEngine.findOne(selector, template)

    if (templateElement === null) {
      return
    }

    content = this._resolvePossibleFunction(content)

    if (!content) {
      templateElement.remove()
      return
    }

    if (isElement(content)) {
      this._putElementInTemplate(getElement(content), templateElement)
      return
    }

    if (this._config.html) {
      content = this._maybeSanitize(content)
      templateElement.innerHTML = content
      return
    }

    templateElement.textContent = content
  }

  _maybeSanitize(arg) {
    return this._config.sanitize ? sanitizeHtml(arg, this._config.allowList, this._config.sanitizeFn) : arg
  }

  _resolvePossibleFunction(arg) {
    return typeof arg === 'function' ? arg(this) : arg
  }

  _putElementInTemplate(element, templateElement) {
    if (!this._config.html) {
      templateElement.textContent = element.textContent
      return
    }

    if (templateElement.outerHTML === element.outerHTML) { // is the same
      return
    }

    templateElement.innerHTML = ''
    templateElement.appendChild(element)
  }
}

export default TemplateFactory
