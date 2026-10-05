import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill } from 'remotion';
import { Search, Info, ThumbsUp, ThumbsDown } from 'lucide-react';
import { COLORS, EASINGS } from '../../brand';
import { FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, CLAMP } from '../../lib/kit';
import { WebBrowserFrame, Marker } from '../../lib/browser';

// =============================================================================
// 6.4/6.5 — the REAL Cloudflare Workers AI pricing page (TSX clone of
// developers.cloudflare.com/workers-ai/platform/pricing), highlighted on cue:
// master 170.0 start · "10,000 credits every single day" 170.88 -> f26 ·
// "neurons" 175.06 -> f152 · "resets every day" 176.07 -> f182. (P3)
// =============================================================================
export const compositionConfig = { id: 'CreditsStat', durationInSeconds: 9.4, fps: 30, width: 1920, height: 1080 };

const CF = '#f6821f'; // cloudflare orange
const PG = { text: '#1d1d1d', dim: '#595959', line: '#e5e5e5', side: '#fafafa', link: '#0051c3' } as const;

const SIDEBAR = ['Overview', 'Getting started', 'Models', 'Configuration', 'Features', 'Guides'];
const PLATFORM = ['Pricing', 'Data usage', 'Limits', 'Glossary', 'AI Gateway', 'Errors'];
const RAIL = ['Overview', 'What are Neurons?', 'LLM model pricing', 'Embeddings model pricing', 'Image model pricing', 'Audio model pricing'];

const CloudflareLogo: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 64 32">
    <path fill={CF} d="M44 26H12c-4 0-8-3.4-8-8 0-4 3-7.3 6.8-7.9C12.2 5.3 16.7 2 22 2c6 0 11 4.2 12.6 9.8.9-.4 1.9-.6 2.9-.6 4.1 0 7.5 3.3 7.5 7.4 0 .5 0 1-.1 1.4H44v6z" />
  </svg>
);

const CreditsStat: React.FC = () => {
  const frame = useCurrentFrame();
  // settle scroll: bring the free-allocation paragraph into full view, then a
  // nudge down at "resets every day" to feature the reset line + plan table
  const scrollY = interpolate(frame, [20, 44], [0, 96], { ...CLAMP, easing: EASINGS.easeInOut })
    + interpolate(frame, [176, 196], [0, 132], { ...CLAMP, easing: EASINGS.easeInOut });
  const neuronsUnderline = interpolate(frame, [152, 164], [0, 1], { ...CLAMP, easing: EASINGS.easeInOut });

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.signal} />
      <WebBrowserFrame
        url="developers.cloudflare.com/workers-ai/platform/pricing/"
        tabTitle="Pricing · Cloudflare Workers AI docs"
        favicon={<CloudflareLogo size={24} />}
        appearAt={2}
        scrollY={scrollY}
      >
        <div style={{ width: 1758, fontFamily: FONT_MONO, color: PG.text, background: '#fff' }}>
          {/* docs header */}
          <div style={{ display: 'flex', alignItems: 'center', height: 62, padding: '0 24px', borderBottom: `1px solid ${PG.line}`, gap: 14, position: 'sticky' }}>
            <CloudflareLogo />
            <span style={{ fontWeight: 700, fontSize: 22 }}>Cloudflare Docs</span>
            <div style={{ marginLeft: 130, display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${PG.line}`, borderRadius: 8, padding: '8px 16px', width: 300, color: PG.dim }}>
              <Search size={16} color={PG.dim} /><span style={{ fontSize: 17 }}>Search</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, border: `1px solid ${PG.line}`, borderRadius: 4, padding: '1px 6px' }}>CTRL K</span>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 26, fontSize: 17, color: PG.text }}>
              <span>Directory</span><span>API</span><span>SDKs</span><span>Changelog</span><span>Help ▾</span>
              <span style={{ background: CF, color: '#fff', borderRadius: 999, padding: '8px 20px', fontSize: 17 }}>Log in</span>
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            {/* sidebar */}
            <div style={{ width: 290, flexShrink: 0, background: PG.side, borderRight: `1px solid ${PG.line}`, padding: '20px 0 40px', fontSize: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px 16px' }}>
                <span style={{ color: CF, fontSize: 24 }}>✳</span>
                <span style={{ fontWeight: 700, fontSize: 21 }}>Workers AI</span>
              </div>
              {SIDEBAR.map((s) => (
                <div key={s} style={{ padding: '9px 20px', color: PG.dim }}>{s} {['Getting started', 'Configuration', 'Features', 'Guides'].includes(s) ? '›' : ''}</div>
              ))}
              <div style={{ padding: '9px 20px', fontWeight: 700 }}>Platform ⌄</div>
              {PLATFORM.map((s) => (
                <div key={s} style={{
                  padding: '8px 20px 8px 36px',
                  color: s === 'Pricing' ? PG.text : PG.dim,
                  fontWeight: s === 'Pricing' ? 700 : 400,
                  background: s === 'Pricing' ? '#efefef' : 'transparent',
                  borderRadius: s === 'Pricing' ? 8 : 0,
                  margin: s === 'Pricing' ? '0 10px' : 0,
                }}>{s}</div>
              ))}
            </div>
            {/* main content */}
            <div style={{ flex: 1, padding: '26px 46px 60px', maxWidth: 1010 }}>
              <div style={{ fontSize: 17, color: PG.dim, marginBottom: 22 }}>
                Directory <span style={{ margin: '0 6px' }}>›</span> Workers AI <span style={{ margin: '0 6px' }}>›</span> Platform <span style={{ margin: '0 6px' }}>›</span> <span style={{ color: PG.text }}>Pricing</span>
              </div>
              <h1 style={{ margin: 0, fontSize: 62, fontWeight: 700, letterSpacing: -1 }}>Pricing</h1>
              <div style={{ fontSize: 16, color: PG.dim, margin: '14px 0 26px' }}>Last updated Jul 8, 2026&nbsp;&nbsp;|&nbsp;&nbsp;Copy as Markdown&nbsp;&nbsp;|&nbsp;&nbsp;View as Markdown</div>
              {/* note box */}
              <div style={{ background: '#ebf5ff', border: '1px solid #c6e2ff', borderLeft: '4px solid #3b82f6', borderRadius: 6, padding: '16px 20px', fontSize: 19, lineHeight: 1.6, marginBottom: 26, display: 'flex', gap: 10 }}>
                <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: 3 }} />
                <span><b>Note</b><br />Workers AI has updated pricing to be more granular, with per-model unit-based pricing presented, but still billing in neurons in the back end.</span>
              </div>
              <p style={{ fontSize: 21, lineHeight: 1.75, margin: '0 0 20px' }}>
                Workers AI is included in both the <span style={{ color: PG.link, textDecoration: 'underline' }}>Free and Paid Workers plans</span> and is priced at <b>$0.011 per 1,000 Neurons</b>.
              </p>
              <p style={{ fontSize: 21, lineHeight: 1.75, margin: '0 0 20px' }}>
                Our free allocation allows anyone to use a total of{' '}
                <Marker start={28} color={`${COLORS.warn}b3`} pad={6}>
                  <b>10,000{' '}
                    <span style={{ position: 'relative' }}>
                      Neurons
                      <span style={{ position: 'absolute', left: 0, right: 0, bottom: -3, height: 4, background: CF, borderRadius: 2, transform: `scaleX(${neuronsUnderline})`, transformOrigin: 'left' }} />
                    </span>
                    {' '}per day at no charge</b>
                </Marker>
                . To use more than 10,000 Neurons per day, you need to sign up for the <span style={{ color: PG.link, textDecoration: 'underline' }}>Workers Paid plan</span>.
              </p>
              <p style={{ fontSize: 21, lineHeight: 1.75, margin: '0 0 20px' }}>
                <Marker start={186} color={`${COLORS.warn}b3`} pad={6}>All limits reset daily at 00:00 UTC.</Marker> If you exceed any one of the above limits, further operations will fail with an error.
              </p>
              {/* plan table */}
              <div style={{ border: `1px solid ${PG.line}`, borderRadius: 8, overflow: 'hidden', marginTop: 30, fontSize: 19 }}>
                <div style={{ display: 'flex', borderBottom: `1px solid ${PG.line}`, fontWeight: 700, background: PG.side }}>
                  <div style={{ width: 240, padding: '14px 18px' }} />
                  <div style={{ width: 330, padding: '14px 18px' }}>Free allocation</div>
                  <div style={{ flex: 1, padding: '14px 18px' }}>Pricing</div>
                </div>
                <div style={{ display: 'flex', borderBottom: `1px solid ${PG.line}` }}>
                  <div style={{ width: 240, padding: '14px 18px', fontWeight: 700 }}>Workers Free</div>
                  <div style={{ width: 330, padding: '14px 18px' }}>10,000 Neurons per day</div>
                  <div style={{ flex: 1, padding: '14px 18px', color: PG.dim }}>N/A - Upgrade to Workers Paid</div>
                </div>
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 240, padding: '14px 18px', fontWeight: 700 }}>Workers Paid</div>
                  <div style={{ width: 330, padding: '14px 18px' }}>10,000 Neurons per day</div>
                  <div style={{ flex: 1, padding: '14px 18px' }}>$0.011 / 1,000 Neurons</div>
                </div>
              </div>
              <h2 style={{ fontSize: 40, fontWeight: 700, margin: '46px 0 16px' }}>What are Neurons?</h2>
              <p style={{ fontSize: 21, lineHeight: 1.75, margin: 0, color: PG.text }}>
                Neurons are our way of measuring AI outputs across different models, representing the GPU compute needed to perform your request.
              </p>
            </div>
            {/* right rail */}
            <div style={{ width: 300, flexShrink: 0, padding: '30px 26px', fontSize: 17, color: PG.dim }}>
              <div style={{ fontWeight: 700, fontSize: 19, color: PG.text, marginBottom: 14 }}>On this page</div>
              {RAIL.map((s, i) => (
                <div key={s} style={{ padding: '7px 0 7px 14px', borderLeft: `2px solid ${i === 0 ? PG.text : PG.line}`, color: i === 0 ? PG.text : PG.dim }}>{s}</div>
              ))}
              <div style={{ marginTop: 26, borderTop: `1px solid ${PG.line}`, paddingTop: 18, letterSpacing: 1, fontSize: 15 }}>WAS THIS HELPFUL?</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${PG.line}`, borderRadius: 8, padding: '6px 14px' }}><ThumbsUp size={15} /> Yes</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1px solid ${PG.line}`, borderRadius: 8, padding: '6px 14px' }}><ThumbsDown size={15} /> No</span>
              </div>
            </div>
          </div>
        </div>
      </WebBrowserFrame>
    </AbsoluteFill>
  );
};
export default CreditsStat;
