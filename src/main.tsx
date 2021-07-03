import { batch, createEffect, createMemo, createSignal } from "solid-js";
import { render } from "solid-js/web";
import "virtual:windi.css";
import correctImage from "./assets/correct.png"; // https://www.ac-illust.com/main/detail.php?id=2637780
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
  lang,
  continuous: true,
  interimResults: true,
  maxAlternatives: 1,
  onend() {
    batch(() => {
      setSpeaking();
      setSpokenWord("");
      setRecognitionError();
    });
    const start: () => unknown = () => (speechSynthesis.speaking ? setTimeout(start, 200) : recognition.start());
    start();
  },
  onaudiostart: () =>
    batch(() => {
      setSpeaking(true);
      setSpokenWord("");
      setRecognitionError();
    }),
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
      answerTimerId = setTimeout(answer, 1000);
    }
  },
});

const Main = () => {
  recognition.start();
  const utterance = assign(new SpeechSynthesisUtterance(), { lang, rate: 1.1, pitch: 1.1, onstart: () => recognition.stop() });
  const speak = (text: string) => {
    utterance.text = text;
    speechSynthesis.speak(utterance);
  };
  createEffect(() => speak(question().speech));
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
      <main class="relative flex-auto flex items-center justify-center text-12vw">
        <QuestionAndAnswer question={question()} answer={spokenAnswer() ?? undefined} />
        <img
          class="absolute inset-0 m-auto pointer-events-none object-contain w-50vw h-50vh"
          src={correctImage}
          hidden={!answerIsCorrect()}
        />
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
        onClick={() => recognition.stop()}
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
