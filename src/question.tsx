interface Question {
  x: number;
  y: number;
  text: string;
  correctAnswer: number;
}

const randomInt = (upper: number) => (Math.random() * upper) | 0;

const questionFactories: (() => Question)[] = [
  () => {
    const x = randomInt(20);
    const y = randomInt(20);
    return { x, y, correctAnswer: x + y, text: `${x} + ${y} = ` };
  },
  () => {
    let x = randomInt(20);
    let y = randomInt(20);
    if (x < y) {
      [x, y] = [y, x];
    }
    return { x, y, correctAnswer: x - y, text: `${x} - ${y} = ` };
  },
];

export const createQuestion = (): Question => questionFactories[(Math.random() * questionFactories.length) | 0]!();

export const QuestionAndAnswer = (props: { question: Question; answer?: number }) => {
  return (
    <div class="flex items-center justify-center whitespace-pre">
      <span>{props.question.text}</span>
      <span class="w-2ex">{props.answer}</span>
    </div>
  );
};

export const toAnswer = (word: string) => {
  const numeric = word && word.match(/(-?[0-9]+)[^0-9]*$/)?.[1];
  return numeric ? +numeric : undefined;
};
