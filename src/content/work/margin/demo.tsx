import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { Phone } from '~/components/frames/Phone';
import { prompts, written, yearBefore } from './data';
import { EntryScreen, LINE, TodayScreen } from './screens';
import { ink, m, words, type InkId } from './theme';

// The new dot drops in and a ring of its ink spreads from it. Reduced motion
// skips both: the dot is simply there.
const keyframes = `
@keyframes mg-drop {
  0% { transform: scale(3.4); opacity: 0; }
  38% { transform: scale(0.78); opacity: 1; }
  62% { transform: scale(1.28); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes mg-bloom { 0% { transform: scale(0.3); opacity: 0.95; } 100% { transform: scale(1.9); opacity: 0; } }
@keyframes mg-tick { 0%, 55% { color: #B13A25; } 100% { color: #5C5F6E; } }
.mg-drop { transform-box: fill-box; transform-origin: center; animation: mg-drop 760ms cubic-bezier(.3,.7,.2,1) 360ms both; }
.mg-bloom { transform-box: fill-box; transform-origin: center; animation: mg-bloom 1100ms cubic-bezier(.2,.7,.3,1) 620ms both; }
.mg-tick { animation: mg-tick 1600ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .mg-drop, .mg-tick { animation: none; }
  .mg-bloom { display: none; }
}
`;

const hidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap'
};

/** Live demo: answer today's question, pick an ink, and watch the year fill in. */
export default function WriteTodayDemo() {
  const [text, setText] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [chosen, setChosen] = useState<InkId | null>(null);
  const [saved, setSaved] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [overflowing, setOverflowing] = useState(false);
  const [message, setMessage] = useState('');
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const focusNext = useRef<'heading' | 'field' | null>(null);

  // Folded, the field shows three lines; past that, Keep writing turns red pencil.
  useLayoutEffect(() => {
    const el = fieldRef.current;
    if (!el || expanded) return;
    setOverflowing(el.scrollHeight > LINE * 3 + 2);
  }, [text, expanded, saved, promptIndex]);

  useEffect(() => {
    if (focusNext.current === 'heading') headingRef.current?.focus();
    if (focusNext.current === 'field') fieldRef.current?.focus();
    focusNext.current = null;
  }, [saved]);

  const prompt = prompts[promptIndex];

  const save = () => {
    if (!words(text)) return;
    const total = written(yearBefore) + 1;
    const name = chosen ? ink(chosen).name.toLowerCase() : 'plain ink blue';
    setMessage(`Saved. November 4 now has a dot in ${name}. ${total} days written in 2025.`);
    focusNext.current = 'heading';
    setSaved(true);
  };

  return (
    <Phone fit screen={m.paper}>
      <style>{keyframes}</style>
      {saved ? (
        <EntryScreen
          prompt={prompt}
          text={text.trim()}
          ink={chosen}
          time='Just now'
          data={yearBefore}
          fresh
          headingRef={headingRef}
          onEdit={() => {
            focusNext.current = 'field';
            setMessage('Editing today’s page.');
            setSaved(false);
          }}
        />
      ) : (
        <TodayScreen
          prompt={prompt}
          text={text}
          expanded={expanded}
          ink={chosen}
          overflowing={overflowing}
          fieldRef={fieldRef}
          onText={setText}
          onExpand={() => setExpanded((v) => !v)}
          onInk={setChosen}
          onSave={save}
          onPrompt={() => {
            const next = (promptIndex + 1) % prompts.length;
            setPromptIndex(next);
            setMessage(`Today’s question: ${prompts[next]}`);
          }}
        />
      )}
      <p aria-live='polite' style={hidden}>
        {message}
      </p>
    </Phone>
  );
}
