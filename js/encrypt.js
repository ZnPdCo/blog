(function () {
  var STORAGE_KEY = 'hexo-encrypt-password'

  function hexToBytes(hex) {
    var bytes = new Uint8Array(hex.length / 2)
    for (var i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16)
    }
    return bytes
  }

  function getBlocks() {
    return document.querySelectorAll('.encrypted-block')
  }

  function sha256Hex(str) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(function (hash) {
      var hex = ''
      var view = new Uint8Array(hash)
      for (var i = 0; i < view.length; i++) {
        hex += ('0' + view[i].toString(16)).slice(-2)
      }
      return hex
    })
  }

  function doDecryptAll(password) {
    var blocks = getBlocks()
    if (!blocks.length || !window.crypto || !window.crypto.subtle) {
      return Promise.resolve(false)
    }

    var raw = blocks[0].getAttribute('data-encrypt')
    if (!raw) return Promise.resolve(false)
    var firstData = JSON.parse(raw)

    return sha256Hex(password).then(function (h) {
      if (h !== firstData.h) return false

      var keyHash = hexToBytes(h).buffer
      return crypto.subtle.importKey('raw', keyHash, { name: 'AES-CBC' }, false, ['decrypt']).then(function (key) {
        var promises = []
        for (var b = 0; b < blocks.length; b++) {
          promises.push((function (block) {
            var r = block.getAttribute('data-encrypt')
            if (!r) return Promise.resolve()
            var data = JSON.parse(r)
            var iv = hexToBytes(data.iv)
            var ct = hexToBytes(data.ct)
            return crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, key, ct).then(function (decrypted) {
              var text = new TextDecoder().decode(decrypted)
              var contentDiv = block.querySelector('.encrypted-content')
              var inputArea = block.querySelector('.encrypt-input-area')
              if (contentDiv && inputArea) {
                contentDiv.innerHTML = text
                contentDiv.style.display = ''
                inputArea.style.display = 'none'
                block.classList.add('decrypted')
              }
            })
          })(blocks[b]))
        }
        return Promise.all(promises).then(function () { return true })
      })
    })
  }

  function showInputForms() {
    var blocks = getBlocks()
    for (var i = 0; i < blocks.length; i++) {
      ;(function (block) {
        var btn = block.querySelector('.encrypt-submit-btn')
        var input = block.querySelector('.encrypt-password-input')
        if (btn && input) {
          function submit() {
            var pwd = input.value
            if (!pwd) return
            doDecryptAll(pwd).then(function (success) {
              if (success) {
                try { localStorage.setItem(STORAGE_KEY, pwd) } catch (e) {}
              } else {
                alert('密码错误，请重试。')
              }
            }).catch(function (e) {
              alert('解密出错: ' + e.message)
            })
          }
          btn.onclick = submit
          input.onkeydown = function (e) {
            if (e.key === 'Enter') submit()
          }
        }
      })(blocks[i])
    }
  }

  function init() {
    if (!getBlocks().length || !window.crypto || !window.crypto.subtle) return

    var stored
    try { stored = localStorage.getItem(STORAGE_KEY) } catch (e) {}

    if (stored) {
      var raw = getBlocks()[0].getAttribute('data-encrypt')
      if (raw) {
        var data = JSON.parse(raw)
        sha256Hex(stored).then(function (h) {
          if (h === data.h) {
            doDecryptAll(stored).catch(function () {})
          } else {
            // stored password changed on server, show inputs
            showInputForms()
          }
        })
        return
      }
    }

    showInputForms()
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
