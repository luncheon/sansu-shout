import { batch, createEffect, createMemo, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "virtual:windi.css";
import { createQuestion, QuestionAndAnswer, toAnswer } from "./question";
import "./styles.css";

const lang = "ja";

const [question, setQuestion] = createSignal(createQuestion());

const [speaking, setSpeaking] = createSignal<boolean>();
const [spokenWord, setSpokenWord] = createSignal("");
const [spokenAnswer, setSpokenAnswer] = createSignal<number | null | undefined>();
const [recognitionError, setRecognitionError] = createSignal<[string, string] | undefined>();
const answerIsCorrect = createMemo(() => spokenAnswer() === question().correctAnswer);

const assign: <T>(target: T, source: Partial<T>) => T = Object.assign;

let answerTimerId: number | undefined;
const recognition = assign(new (window.SpeechRecognition ?? window.webkitSpeechRecognition)(), {
  lang: lang,
  continuous: true,
  interimResults: true,
  maxAlternatives: 1,
  onend: () => setSpeaking(false),
  onaudiostart: () =>
    batch(() => {
      setSpeaking(true);
      setSpokenWord("");
      setRecognitionError();
    }),
  onaudioend: () => setSpeaking(false),
  onerror: (e) => {
    setRecognitionError([e.error, e.message]);
    setTimeout(resetRecognition, 1000);
  },
  onresult: ({ results, resultIndex }) => {
    const result = results[resultIndex];
    const spokenWord = result?.[0]?.transcript ?? "";
    clearTimeout(answerTimerId);
    if (result?.isFinal) {
      batch(() => {
        setSpokenWord(spokenWord);
        setSpokenAnswer(toAnswer(spokenWord) ?? null);
      });
    } else {
      setSpokenWord(spokenWord);
      answerTimerId = setTimeout(() => setSpokenAnswer(toAnswer(spokenWord)), 1000);
    }
  },
});

const resetRecognition = () => {
  setSpokenWord("");
  setSpokenAnswer();
  setRecognitionError();
  recognition.stop();
  setTimeout(() => recognition.start());
};

const Main = () => {
  const startRecognition = () => recognition.start();
  const utteranceOptions: Readonly<Partial<SpeechSynthesisUtterance>> = { lang, rate: 1.25, pitch: 1.1 };
  const questionUtterance = assign(new SpeechSynthesisUtterance(), { ...utteranceOptions, onend: startRecognition });
  const correctAnswerUtterance = assign(new SpeechSynthesisUtterance("正解"), utteranceOptions);
  const wrongAnswerUtterance = assign(new SpeechSynthesisUtterance("ちがうよ?"), { ...utteranceOptions, onend: startRecognition });
  createEffect(() => {
    questionUtterance.text = question().speech;
    speechSynthesis.speak(questionUtterance);
  });
  createEffect(() => {
    if (spokenAnswer() === undefined) {
      return;
    }
    if (spokenAnswer() === null) {
      return startRecognition();
    }
    recognition.stop();
    if (answerIsCorrect()) {
      speechSynthesis.speak(correctAnswerUtterance);
      setTimeout(() => {
        batch(() => {
          setSpokenAnswer(undefined);
          setQuestion(createQuestion());
        });
      }, 1000);
    } else {
      speechSynthesis.speak(wrongAnswerUtterance);
      setTimeout(() => setSpokenAnswer(undefined), 1000);
    }
  });
  return (
    <>
      <main class="relative flex-auto flex items-center justify-center text-12vw">
        <QuestionAndAnswer question={question()} answer={spokenAnswer() ?? undefined} />
        <div
          class="absolute inset-0 flex items-center justify-center text-24vw pointer-events-none select-none"
          hidden={!answerIsCorrect()}
        >
          ⭕️
        </div>
      </main>
      <div class="fixed left-4 bottom-3 font-sans">
        <div class="font-bold text-xs opacity-60 mb-1">きこえた ことば</div>
        {spokenWord()}
        {speaking() ? "..." : "　"}
        <span class="text-red-400">{recognitionError()}</span>
      </div>
      <button
        class="fixed right-4 bottom-2 p-0 text-xs opacity-60 border-b-current border-b-1 font-sans"
        type="button"
        onClick={resetRecognition}
      >
        マイクリセット
      </button>
    </>
  );
};

const Header = () => {
  return (
    <header class="pl-4 pt-3 self-start inline-flex flex-col items-center">
      <h1>
        <span class="text-pink-200">さんすう</span>
        <span class="text-yellow-100">シャウト</span>
      </h1>
      <p class="text-green-100" style="letter-spacing:1px">
        こたえが わかったら さけんでね
      </p>
    </header>
  );
};

const App = () => {
  const [started, setStarted] = createSignal(false);
  return (
    <div class="h-full flex flex-col items-stretch">
      <Header />
      {started() ? (
        <Main />
      ) : (
        <main class="flex-auto flex items-center justify-center text-12vw">
          <button class="border-b-current border-b-3" type="button" onClick={() => setStarted(true)}>
            はじめる
          </button>
        </main>
      )}
    </div>
  );
};

render(() => <App />, document.body);
