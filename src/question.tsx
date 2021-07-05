interface Question {
  correctAnswer: number;
  displayText: string;
  speechText: string;
}

const randomInt = (upper: number) => (Math.random() * upper) | 0;

const speechNumber = (n: number) => (n === 0 ? "ゼロ" : n);
const questionFactories: (() => Question)[] = [
  () => {
    const x = randomInt(20);
    const y = randomInt(20);
    return { correctAnswer: x + y, displayText: `${x} + ${y} = `, speechText: `${speechNumber(x)} たす ${speechNumber(y)} は?` };
  },
  () => {
    let x = randomInt(20);
    let y = randomInt(20);
    if (x < y) {
      [x, y] = [y, x];
    }
    return { correctAnswer: x - y, displayText: `${x} - ${y} = `, speechText: `${speechNumber(x)} ひく ${speechNumber(y)} は?` };
  },
];

export const createQuestion = (): Question => questionFactories[(Math.random() * questionFactories.length) | 0]!();

export const QuestionAndAnswer = (props: { question: Question; answer?: number }) => {
  return (
    <div class="flex items-center justify-center whitespace-pre">
      <span>{props.question.displayText}</span>
      <span class="w-2ex">{props.answer}</span>
    </div>
  );
};

export const toAnswer = (word: string) => {
  const numeric = word && word.match(/(-?[0-9]+)[^0-9]*$/)?.[1];
  return numeric ? +numeric : undefined;
};
