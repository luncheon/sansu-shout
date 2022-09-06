import builtTimestamp from "built-timestamp";
import { is } from "isaaccss";
import { batch, createEffect, createMemo, createSignal, For, JSX } from "solid-js";
import { render } from "solid-js/web";
import correctImage from "./assets/correct.webp"; // https://www.ac-illust.com/main/detail.php?id=2637780
import { QuestionAndAnswer, questionFactories, toAnswer } from "./question";
import "./styles.css";

const lang = "ja";

const [filteredQuestionFactories, setFilteredQuestionFactories] = createSignal<typeof questionFactories>(questionFactories);
const createQuestion = () => filteredQuestionFactories()[(Math.random() * filteredQuestionFactories().length) | 0]!.question();

const [question, setQuestion] = createSignal(createQuestion());

const [speaking, setSpeaking] = createSignal<boolean>();
const [spokenWord, setSpokenWord] = createSignal("");
const [spokenAnswer, setSpokenAnswer] = createSignal<number | null | undefined>();
const [recognitionError, setRecognitionError] = createSignal<[string, string] | undefined>();
const answerIsCorrect = createMemo(() => spokenAnswer() === question().correctAnswer);

const assign: <T>(target: T, source: Partial<T>) => T = Object.assign;

let answerTimerId: number | undefined;
const recognition = assign(new (window.SpeechRecognition ?? window.webkitSpeechRecognition)(), {
  lang,
  continuous: true,
  interimResults: true,
  maxAlternatives: 1,
  onend: () => {
    batch(() => {
      setSpeaking();
      setSpokenWord("");
      setRecognitionError();
    });
    startRecognition();
  },
  onaudiostart: () => setSpeaking(true),
  onerror: (e) => {
    setRecognitionError([e.error, e.message]);
    setTimeout(() => recognition.stop(), 1000);
  },
  onresult: ({ results, resultIndex }) => {
    const result = results[resultIndex];
    const spokenWord = result?.[0]?.transcript ?? "";
    const answer = () => setSpokenAnswer(toAnswer(spokenWord) ?? null);
    clearTimeout(answerTimerId);
    if (result?.isFinal) {
      batch(() => {
        setSpokenWord(spokenWord);
        answer();
      });
    } else {
      setSpokenWord(spokenWord);
      answerTimerId = setTimeout(answer, 600);
    }
  },
});
const startRecognition: () => unknown = () => (speechSynthesis.speaking ? setTimeout(startRecognition, 200) : recognition.start());

const Main = () => {
  setTimeout(startRecognition, 200);
  const utterance = assign(new SpeechSynthesisUtterance(), { lang, rate: 1.1, pitch: 1.1, onstart: () => recognition.stop() });
  const speak = (text: string) => {
    utterance.text = text;
    speechSynthesis.speak(utterance);
  };
  createEffect(() => speak(question().speechText));
  createEffect(() => {
    if (spokenAnswer() === undefined) {
      return;
    }
    if (spokenAnswer() === null) {
      return recognition.stop();
    }
    recognition.stop();
    if (answerIsCorrect()) {
      speak("正解");
      setTimeout(() => {
        batch(() => {
          setSpokenAnswer(undefined);
          setQuestion(createQuestion());
        });
      }, 1000);
    } else {
      speak("ちがうよ");
      setTimeout(() => setSpokenAnswer(undefined), 1000);
    }
  });
  return (
    <>
      <main class={is`pos:relative flex:1 d:flex align-items:center justify-content:center font-size:12vw`}>
        <QuestionAndAnswer question={question()} answer={spokenAnswer() ?? undefined} />
        <img
          class={is`pos:absolute inset:0 m:auto pointer-events:none object-fit:contain w:50vw h:50vh`}
          src={correctImage}
          hidden={!answerIsCorrect()}
        />
      </main>
      <div class={is`pos:fixed left:16px bottom:12px font-family:sans-serif`}>
        <div class={is`font-weight:bold font-size:.75rem opacity:.6 m-b:4px`}>きこえた ことば</div>
        {spokenWord()}
        {speaking() ? "..." : "　"}
        <span class={is`c:$red-4`}>{recognitionError()}</span>
      </div>
      <button
        class={is`pos:fixed right:16px bottom:8px p:0 font-size:.75rem opacity:.6 b-b-w:1px b-b-c:currentColor font-family:sans-serif`}
        type="button"
        onClick={() => recognition.stop()}
      >
        マイクリセット
      </button>
    </>
  );
};

const Header = () => {
  const iso = new Date(builtTimestamp).toISOString();
  const ver = iso
    .replace(/[-]/g, ".")
    .replace(/T/, "-")
    .replace(/\.[0-9]{3}Z$/, "")
    .replace(/:/g, "");
  return (
    <header class={is`p-l:16px p-t:12px align-self:start d:inline-flex flex-direction:column align-items:center`}>
      <a class={is`text-decoration:none`} href="/">
        <h1 class={is`font-size:2em`}>
          <span class={is`c:$pink-2`}>さんすう</span>
          <span class={is`c:$yellow-1`}>シャウト</span>
        </h1>
        <p class={is`letter-spacing:1px c:$green-1`}>こたえが わかったら さけんでね</p>
      </a>
      <time class={is`letter-spacing:3px  c:transparent ::selection/c:$orange-1`} datetime={iso}>
        {ver}
      </time>
    </header>
  );
};

const LabeledCheckbox = ({
  checked,
  onChange,
  children,
}: {
  checked?: boolean;
  onChange?: JSX.InputHTMLAttributes<HTMLInputElement>["onChange"];
  children: JSX.Element;
}) => (
  <label class={is`d:block cursor:pointer d:flex align-items:center user-select:none gap:0.5em m-b:0.125em`}>
    <input class={is`w:1em h:1em`} type="checkbox" checked={checked} onChange={onChange} />
    {children}
  </label>
);

const App = () => {
  const [started, setStarted] = createSignal(false);
  const [questionsEnabled, setQuestionsEnabled] = createSignal(questionFactories.map(() => true));
  return (
    <div class={is`h:100% d:flex flex-direction:column align-items:stretch`}>
      <Header />
      {started() ? (
        <Main />
      ) : (
        <main class={is`flex:1 d:flex flex-direction:column align-items:center justify-content:center`}>
          <div style:font-size="min(6vw,6vh)">
            <For each={questionFactories}>
              {({ displayText }, i) => (
                <LabeledCheckbox
                  checked={questionsEnabled()[i()]}
                  onChange={(e) => setQuestionsEnabled((current) => Object.assign([...current], { [i()]: e.currentTarget.checked }))}
                  children={displayText}
                />
              )}
            </For>
          </div>
          <button
            class={is`b-b-c:currentColor b-b-w:3 m-t:0.125em :disabled/opacity:.7 :disabled/cursor:default :disabled/b-b-c:transparent`}
            style:font-size="min(18vw,18vh)"
            type="button"
            disabled={!questionsEnabled().some(Boolean)}
            onClick={() => {
              setFilteredQuestionFactories(questionFactories.filter((_, i) => questionsEnabled()[i]));
              setQuestion(createQuestion());
              setStarted(true);
            }}
          >
            はじめる
          </button>
        </main>
      )}
    </div>
  );
};

render(() => <App />, document.body);
