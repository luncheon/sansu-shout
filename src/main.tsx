import builtTimestamp from "built-timestamp";
import { batch, createEffect, createMemo, createSignal, For, JSX } from "solid-js";
import { render } from "solid-js/web";
import "virtual:windi.css";
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
      speak("??????");
      setTimeout(() => {
        batch(() => {
          setSpokenAnswer(undefined);
          setQuestion(createQuestion());
        });
      }, 1000);
    } else {
      speak("????????????");
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
        <div class="font-bold text-xs opacity-60 mb-1">???????????? ?????????</div>
        {spokenWord()}
        {speaking() ? "..." : "???"}
        <span class="text-red-400">{recognitionError()}</span>
      </div>
      <button
        class="fixed right-4 bottom-2 p-0 text-xs opacity-60 border-b-current border-b-1 font-sans"
        type="button"
        onClick={() => recognition.stop()}
      >
        ?????????????????????
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
    <header class="pl-4 pt-3 self-start inline-flex flex-col items-center">
      <a class="no-underline" href="/">
        <h1 class="text-2em">
          <span class="text-pink-200">????????????</span>
          <span class="text-yellow-100">????????????</span>
        </h1>
        <p class="tracking-1px text-green-100">???????????? ??????????????? ???????????????</p>
      </a>
      <time class="tracking-3px text-transparent selection:text-orange-100" datetime={iso}>
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
  <label class="block cursor-pointer flex items-center select-none gap-0.5em mb-0.125em">
    <input class="w-1em h-1em" type="checkbox" checked={checked} onChange={onChange} />
    {children}
  </label>
);

const App = () => {
  const [started, setStarted] = createSignal(false);
  const [questionsEnabled, setQuestionsEnabled] = createSignal(questionFactories.map(() => true));
  return (
    <div class="h-full flex flex-col items-stretch">
      <Header />
      {started() ? (
        <Main />
      ) : (
        <main class="flex-auto flex flex-col items-center justify-center">
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
            class="border-b-current border-b-3 mt-0.125em disabled:(opacity-70 cursor-default border-b-transparent)"
            style:font-size="min(18vw,18vh)"
            type="button"
            disabled={!questionsEnabled().some(Boolean)}
            onClick={() => {
              setFilteredQuestionFactories(questionFactories.filter((_, i) => questionsEnabled()[i]));
              setQuestion(createQuestion());
              setStarted(true);
            }}
          >
            ????????????
          </button>
        </main>
      )}
    </div>
  );
};

render(() => <App />, document.body);
