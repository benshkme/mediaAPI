import { KALTURA_DEFAULTS } from '../constants/kaltura'

const PREVIEW_W = 320

const PLACEMENT_ANCHOR = {
  CENTER_RIGHT:   { hAlign: 'right',  vAlign: 'center' },
  CENTER_LEFT:    { hAlign: 'left',   vAlign: 'center' },
  TOP_RIGHT:      { hAlign: 'right',  vAlign: 'top' },
  TOP_LEFT:       { hAlign: 'left',   vAlign: 'top' },
  TOP_CENTER:     { hAlign: 'center', vAlign: 'top' },
  BOTTOM_RIGHT:   { hAlign: 'right',  vAlign: 'bottom' },
  BOTTOM_LEFT:    { hAlign: 'left',   vAlign: 'bottom' },
  BOTTOM_CENTER:  { hAlign: 'center', vAlign: 'bottom' },
  CENTER_CENTER:  { hAlign: 'center', vAlign: 'center' },
}

const OVERLAY_COLORS = ['#4a90d9', '#e67e22', '#27ae60', '#8e44ad', '#e74c3c']

function computeOverlayRect(ov, fw, fh) {
  const scaleW = ov.scaleWidth ?? KALTURA_DEFAULTS.SCALE_WIDTH
  const scaleH = ov.scaleHeight ?? KALTURA_DEFAULTS.SCALE_HEIGHT
  const marginW = ov.marginWidth ?? KALTURA_DEFAULTS.MARGINS_PERCENTAGE
  const marginH = ov.marginHeight ?? KALTURA_DEFAULTS.MARGINS_PERCENTAGE

  const rw = scaleW * fw
  const rh = scaleH * fh
  const mw = marginW * fw
  const mh = marginH * fh

  const anchor = PLACEMENT_ANCHOR[ov.placement] || PLACEMENT_ANCHOR.CENTER_RIGHT

  let x, y
  if (anchor.hAlign === 'left') x = mw
  else if (anchor.hAlign === 'right') x = fw - rw - mw
  else x = (fw - rw) / 2

  if (anchor.vAlign === 'top') y = mh
  else if (anchor.vAlign === 'bottom') y = fh - rh - mh
  else y = (fh - rh) / 2

  return { x, y, w: rw, h: rh }
}

export default function ClipPreview({ clip, targetWidth, targetHeight }) {
  const aspectRatio = (targetWidth && targetHeight)
    ? parseInt(targetWidth) / parseInt(targetHeight)
    : 16 / 9

  const fw = PREVIEW_W
  const fh = Math.round(fw / aspectRatio)

  return (
    <svg viewBox={`0 0 ${fw} ${fh}`} width={fw} height={fh} style={{ display: 'block', border: '1px solid #ccc' }}>
      {/* Background frame */}
      <rect x={0} y={0} width={fw} height={fh} fill="#2c2c2c" />
      {clip.background.entryId && (
        <text x={fw / 2} y={fh / 2} textAnchor="middle" dominantBaseline="middle" fill="#aaa" fontSize={10}>
          {clip.background.entryId}
        </text>
      )}

      {/* Overlay rectangles */}
      {clip.overlays.map((ov, i) => {
        if (!ov.entryId) return null
        const { x, y, w, h } = computeOverlayRect(ov, fw, fh)
        const color = OVERLAY_COLORS[i % OVERLAY_COLORS.length]
        const rx = ov.shape === 'RECTANGLE_ROUNDED' ? 8 : 0
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={h} fill={color} fillOpacity={0.5} stroke={color} strokeWidth={1} rx={rx} />
            <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={9}>
              {ov.entryId.length > 10 ? ov.entryId.slice(0, 10) + '…' : ov.entryId}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
