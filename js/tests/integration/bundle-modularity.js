import Tooltip from '../../dist/tooltip'
import '../../dist/carousel'

window.addEventListener('load', () => {
  [...document.querySelectorAll('[data-bs-toggle="tooltip"]')]
    .map(tooltipNode => new Tooltip(tooltipNode))
})
