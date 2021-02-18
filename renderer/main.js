Vue.config.productionTip = false

const state = (window.state = new Map())

window.handleOverlaysReceived = overlays => {
  for (const [overlayId, payload] of Object.entries(overlays)) {
    const advancedMode = payload && typeof payload === 'object'
    const template = advancedMode ? payload.template : payload
    const data = advancedMode ? payload.data || {} : {}
    const css = advancedMode ? payload.css || '' : ''
    if (!state.has(overlayId) && template != null) {
      state.set(overlayId, createOverlay(overlayId))
    }
    const overlay = state.get(overlayId)
    if (overlay) {
      if (template == null) {
        overlay.destroy()
        state.delete(overlayId)
      } else {
        overlay.handleNewState(template, css, data)
      }
    }
  }
  return state.size
}

function createOverlay(overlayId) {
  let vm
  let previousTemplate
  let element
  let style
  let previousCss
  return {
    handleNewState(template, css, data) {
      if (css !== previousCss) {
        if (!css && style) {
          style.remove()
        }
        if (css && !style) {
          style = document.createElement('style')
          style.dataset.id = overlayId
          document.getElementsByTagName('head')[0].appendChild(style)
        }
        if (css && style) {
          style.textContent = css
        }
        previousCss = css
      }
      if (template !== previousTemplate) {
        if (element) {
          element.remove()
        }
        if (vm) {
          vm.$destroy()
          vm = null
        }
        element = document.createElement('div')
        element.dataset.id = overlayId
        const content = document.createElement('div')
        content.id = overlayId
        content.innerHTML = template
        document.getElementById('overlayer-main').appendChild(element)
        element.appendChild(content)
        vm = new Vue({
          el: content,
          data: { data },
        })
        previousTemplate = template
      } else if (vm) {
        vm.data = data
      }
    },
    destroy() {
      if (style) {
        style.remove()
      }
      if (element) {
        element.remove()
      }
      if (vm) {
        vm.$destroy()
      }
    },
  }
}

setTimeout(() => {
  document.querySelector('#overlayer-ready').remove()
}, 1000)
