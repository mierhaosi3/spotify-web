import { useState } from 'react'
import { LabLayout } from '@/components/LabLayout'
import { GlassCanvas } from '@/labs/glass/GlassCanvas'
import { GlassContextMenu } from '@/labs/glass/GlassContextMenu'
import { GlassNotification } from '@/labs/glass/GlassNotification'
import { GlassSlider } from '@/labs/glass/GlassSlider'
import { GlassSwitch } from '@/labs/glass/GlassSwitch'
import '@/labs/glass/glass-lab.css'

/** Lightweight CSS wallpapers — large photos live outside the repo */
const WALLPAPER_BLUE =
  'radial-gradient(120% 120% at 20% 20%, #4dc3ff 0%, transparent 50%),' +
  'radial-gradient(120% 120% at 80% 70%, #1a4a8a 0%, transparent 55%),' +
  'linear-gradient(160deg, #0a1628, #122038)'

const WALLPAPER_WARM =
  'radial-gradient(120% 120% at 12% 18%, #ff9d4d 0%, transparent 46%),' +
  'radial-gradient(120% 120% at 82% 14%, #4dc3ff 0%, transparent 44%),' +
  'radial-gradient(130% 130% at 78% 88%, #ff5d8f 0%, transparent 50%),' +
  'linear-gradient(135deg, #b24bd8, #f0793b)'

const LENS_PARAMS = [
  { key: 'strength', label: '折射强度', min: 0, max: 0.6, step: 0.01, default: 0.22 },
  { key: 'depth', label: '镜头厚度', min: 0, max: 1, step: 0.01, default: 0.85 },
  { key: 'curvature', label: '曲率', min: 0, max: 1, step: 0.01, default: 0.6 },
  { key: 'bend', label: '边缘折弯', min: 0, max: 1, step: 0.01, default: 0.55 },
  { key: 'dispersion', label: '色散', min: 0, max: 1, step: 0.01, default: 0.4 },
  { key: 'frost', label: '磨砂', min: 0, max: 5, step: 0.1, default: 0 },
  { key: 'brightness', label: '亮度', min: 0, max: 0.8, step: 0.01, default: 0 },
  { key: 'glow', label: '发光', min: 0, max: 1, step: 0.01, default: 0.55 },
  { key: 'sheen', label: '光泽', min: 0, max: 2, step: 0.01, default: 1.2 },
] as const

type LensKey = (typeof LENS_PARAMS)[number]['key']
type LensState = Record<LensKey, number>

const defaultLens = Object.fromEntries(
  LENS_PARAMS.map((p) => [p.key, p.default]),
) as LensState

export function GlassLabPage() {
  const [switchOn, setSwitchOn] = useState(true)
  const [sliderVal, setSliderVal] = useState(65)
  const [lens, setLens] = useState<LensState>(defaultLens)

  const setOpt = (key: LensKey, val: number) =>
    setLens((prev) => ({ ...prev, [key]: val }))

  return (
    <LabLayout
      title="Liquid Glass"
      description="WebGL refraction over canvas, panels, and controls."
    >
      <div className="glass-lab">
        <section className="section section-canvas">
          <header className="section-header">
            <h2>视频与画布</h2>
            <p>
              移动鼠标控制画布中的镜头位置，右侧可实时调试光学参数。
            </p>
          </header>
          <div className="grid">
            <div className="card tall">
              <div className="preview no-pad">
                <GlassCanvas optics={lens} />
              </div>
              <div className="card-info">
                <h3>画布</h3>
                <p>一个在生成艺术画布上漫游的玻璃镜头</p>
              </div>
            </div>
            <div className="card tall">
              <div
                className="preview lens-panel"
                style={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  gap: 10,
                  padding: '24px 24px 20px',
                }}
              >
                {LENS_PARAMS.map((p) => (
                  <label key={p.key} className="lens-row">
                    <span className="lens-label">{p.label}</span>
                    <input
                      type="range"
                      className="lens-slider"
                      min={p.min}
                      max={p.max}
                      step={p.step}
                      value={lens[p.key]}
                      onChange={(e) => setOpt(p.key, Number(e.target.value))}
                    />
                    <span className="lens-value">
                      {lens[p.key].toFixed(2)}
                    </span>
                  </label>
                ))}
                <button
                  type="button"
                  className="lens-reset"
                  onClick={() => setLens(defaultLens)}
                >
                  重置
                </button>
              </div>
              <div className="card-info">
                <h3>参数调试</h3>
                <p>实时调整透镜光学属性</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-panel">
          <header className="section-header">
            <h2>面板组件</h2>
            <p>真正折射背后壁纸的磨砂玻璃面板。</p>
          </header>
          <div className="grid">
            <div className="card tall">
              <div className="preview no-pad">
                <GlassNotification wallpaper={WALLPAPER_BLUE} />
              </div>
              <div className="card-info">
                <h3>通知卡片</h3>
                <p>悬浮在壁纸上的磨砂玻璃通知面板</p>
              </div>
            </div>
            <div className="card tall">
              <div className="preview no-pad">
                <GlassContextMenu wallpaper={WALLPAPER_WARM} />
              </div>
              <div className="card-info">
                <h3>右键菜单</h3>
                <p>悬浮在壁纸上的玻璃菜单，右键可移动位置</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section section-controls">
          <header className="section-header">
            <h2>交互控件</h2>
            <p>按下时部件融化成玻璃镜头。</p>
          </header>
          <div className="grid">
            <div className="card">
              <div className="preview">
                <GlassSwitch
                  checked={switchOn}
                  onCheckedChange={setSwitchOn}
                  width={74}
                  height={30}
                  activeColor="#1db8ff"
                  trackColor="#0d1f33"
                />
              </div>
              <div className="card-info">
                <h3>开关</h3>
                <p>按下或拖动，白色药丸融化成玻璃镜头</p>
              </div>
            </div>
            <div className="card">
              <div className="preview">
                <GlassSlider
                  value={sliderVal}
                  onValueChange={setSliderVal}
                  width={340}
                  thumbHeight={22}
                  activeColor="#a259ff"
                  trackColor="#2a1f3d"
                />
              </div>
              <div className="card-info">
                <h3>滑块</h3>
                <p>拖动时滑块折射出填充轨道的颜色</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </LabLayout>
  )
}
