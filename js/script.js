const boneco = document.querySelector('#boneco')
const obstaculo = document.querySelector('#obstaculo1')
const cenario = document.querySelector('#cenario')
const botaoPause = document.querySelector('#pause')
const botaoReiniciar = document.querySelector('#reiniciar')
const botoesControles = document.querySelectorAll('.controle')

let posicao = 20
let pausado = false
let ultimoQuadro = null
let quadroAtual = null
const teclasPressionadas = new Set()

document.addEventListener('keydown', controlar)
document.addEventListener('keyup', soltarTecla)
window.addEventListener('blur', () => teclasPressionadas.clear())
boneco.addEventListener('animationend', parar)
botaoPause.addEventListener('click', alternarPausa)
botaoReiniciar.addEventListener('click', reiniciar)

for (const botao of botoesControles) {
    const acao = botao.dataset.acao

    botao.addEventListener('pointerdown', evento => {
        evento.preventDefault()
        if (pausado) return

        if (acao === 'pular') {
            pular()
            return
        }

        moverNaDirecao(acao, 28)
        teclasPressionadas.add(acao)
        botao.setPointerCapture(evento.pointerId)
    })

    for (const tipo of ['pointerup', 'pointercancel', 'lostpointercapture']) {
        botao.addEventListener(tipo, () => teclasPressionadas.delete(acao))
    }

    botao.addEventListener('click', evento => {
        if (acao === 'pular') {
            pular()
        } else if (evento.detail === 0 && !pausado) {
            moverNaDirecao(acao, 28)
        }
    })
}

function controlar(evento) {
    const tecla = evento.key
    const botaoFocado = evento.target instanceof HTMLButtonElement

    if (botaoFocado && (tecla === ' ' || tecla === 'Enter')) return

    if (['ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(tecla)) {
        evento.preventDefault()
    }

    if (pausado) return

    if (tecla === 'ArrowLeft' || tecla === 'ArrowRight') {
        teclasPressionadas.add(tecla === 'ArrowLeft' ? 'tras' : 'frente')
    }

    if (tecla === 'ArrowUp' && !evento.repeat) {
        pular()
    }
}

function soltarTecla(evento) {
    if (evento.key === 'ArrowLeft') teclasPressionadas.delete('tras')
    if (evento.key === 'ArrowRight') teclasPressionadas.delete('frente')
}

function pular() {
    if (pausado || boneco.classList.contains('pulando')) return
    boneco.classList.add('pulando')
}

function moverNaDirecao(direcao, distancia) {
    const deslocamento = direcao === 'tras' ? -distancia : distancia
    const limite = cenario.clientWidth - boneco.offsetWidth
    posicao = Math.max(0, Math.min(limite, posicao + deslocamento))
    boneco.style.left = `${posicao}px`
}

function atualizarMovimento(delta) {
    const direcao =
        Number(teclasPressionadas.has('frente')) -
        Number(teclasPressionadas.has('tras'))

    if (direcao !== 0) {
        moverNaDirecao(direcao < 0 ? 'tras' : 'frente', 360 * delta / 1000)
    }
}

function parar() {
    boneco.classList.remove('pulando')
}

function atualizarJogo(tempo) {
    if (pausado) return

    const delta = ultimoQuadro === null ? 0 : Math.min(tempo - ultimoQuadro, 50)
    atualizarMovimento(delta)
    ultimoQuadro = tempo
    quadroAtual = requestAnimationFrame(atualizarJogo)
}

function alternarPausa() {
    pausado = !pausado
    cenario.classList.toggle('pausado', pausado)
    botaoPause.textContent = pausado ? 'Continuar' : 'Pausar'

    if (pausado) {
        teclasPressionadas.clear()
        ultimoQuadro = null
        cancelAnimationFrame(quadroAtual)
    } else {
        quadroAtual = requestAnimationFrame(atualizarJogo)
    }
}

function reiniciar() {
    posicao = 20
    pausado = false
    ultimoQuadro = null
    teclasPressionadas.clear()

    boneco.style.left = `${posicao}px`
    boneco.classList.remove('pulando')
    cenario.classList.remove('pausado')
    botaoPause.textContent = 'Pausar'

    obstaculo.style.animation = 'none'
    void obstaculo.offsetWidth
    obstaculo.style.animation = ''

    cancelAnimationFrame(quadroAtual)
    quadroAtual = requestAnimationFrame(atualizarJogo)
}

quadroAtual = requestAnimationFrame(atualizarJogo)