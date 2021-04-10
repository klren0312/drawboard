<template>
  <div class="canvas-block">
    <canvas id="canvas"></canvas>
    <div class="group-btn">
      <button @click="undoHandle">后退</button>
      <button @click="clearHandle">清空</button>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue'
import { useEventListener } from '/@/hooks/useEventListener'
interface PointObj {
  x: number,
  y: number
}
export default defineComponent({
  name: 'DrawBoard',
  setup: () => {
    let canvas: HTMLCanvasElement
    let ctx: CanvasRenderingContext2D
    let lineColor: string = '#000' // 颜色
    let painting: boolean = false // 是否处于状态
    let historyList: Array<ImageData> = []
    let pointerId: number // pointEvent id, 用于判断是否处于同一个笔划内
    // 用于使连线连续
    let startXY: PointObj = {
      x: 0,
      y: 0
    }
    onMounted(() => {
      initCanvas()
    })

    /**
     * @description 初始化canvas
     */
    function initCanvas() {
      canvas = <HTMLCanvasElement>document.getElementById('canvas')
      ctx = <CanvasRenderingContext2D>canvas.getContext('2d')
      let width: number = window.innerWidth
      let height: number = window.innerHeight
      if (window.devicePixelRatio) {
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'
        canvas.height = height * window.devicePixelRatio
        canvas.width = width * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
      ctx.imageSmoothingEnabled = true

      useEventListener({
        el: canvas,
        name: 'pointerdown',
        isDebounce: false,
        wait: 0,
        listener: e => startDraw(<PointerEvent>e)
      })

      useEventListener({
        el: canvas,
        name: 'pointermove',
        isDebounce: false,
        wait: 0,
        listener: e => moveDraw(<PointerEvent>e)
      })

      useEventListener({
        el: canvas,
        name: 'pointerup',
        isDebounce: false,
        wait: 0,
        listener: e => cancelDraw(<PointerEvent>e)
      })

      useEventListener({
        el: canvas,
        name: 'pointerleave',
        isDebounce: false,
        wait: 0,
        listener: e => cancelDraw(<PointerEvent>e)
      })
    }

    /**
     * @description 开始
     * @param {PointerEvent} e 事件
     */
    function startDraw(e: PointerEvent) {
      painting = true
      pointerId = e.pointerId
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      doDraw(e, true)
    }

    /**
     * @description 移动
     * @param {PointerEvent} e 事件
     */
    function moveDraw(e: PointerEvent) {
      if (!painting && e.pointerId !== pointerId) {
        return
      } else {
        doDraw(e)
      }
    }

    function cancelDraw(e: PointerEvent) {
      console.log('cancel')
      pointerId = -1
      if (!painting) {
        return false
      }
      painting = false
      historyList.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
      ctx.closePath()
    }

    /**
     * 绘画
     * @param {PointerEvent} e 事件
     * @param {Boolean} isStart 是否是起始点
     */
    function doDraw(e, isStart = false) {
      const event: PointerEvent = e || window.event
      const x: number = event.offsetX
      const y: number = event.offsetY
      ctx.lineWidth = getLineWidth(event)
      ctx.strokeStyle = lineColor
      ctx.beginPath()

      if (!isStart) {
        ctx.moveTo(startXY.x, startXY.y)
        ctx.lineTo(x, y)
      } else {
        ctx.moveTo(x, y)
      }
      ctx.closePath()
      ctx.stroke()
      startXY = {
        x: x,
        y: y
      }
    }

    /**
     * @description 计算线宽
     * @param {PointerEvent} e 事件
     * @return {number} 线宽
     */
    function getLineWidth(e: PointerEvent): number {
      switch (e.pointerType) {
        case 'touch': {
          if (e.width < 10 && e.height < 10) {
            return (e.width + e.height) * 2 + 10;
          } else {
            return (e.width + e.height - 40) / 2;
          }
        }
        case 'pen': return e.pressure * 8;
        default: return (e.pressure) ? e.pressure * 8 : 4;
      }
    }

    /**
     * @description 撤销操作
     */
    function undoHandle() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      try {
        historyList.pop()
        const history: ImageData = historyList[historyList.length - 1]
        if (history) {
          ctx.putImageData(history, 0, 0)
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height)   
        }
      } catch (error) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)  
      }
    }

    function clearHandle() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    return {
      undoHandle,
      clearHandle
    }
  }
})
</script>

<style lang="scss">
.canvas-block {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  #canvas {
    position: absolute;
    top: 0;
    left: 0;
    touch-action: none;
    cursor: crosshair;
  }
  .group-btn {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1;
    cursor: pointer;
    -ms-touch-action: none;
    touch-action: none;
    touch-action-delay: none;
  }
}
</style>
