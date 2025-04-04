import readline from 'readline';

// Helper function to get user input dynamically
export function getUserInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    const decoratedPrompt = `----------------------------\n${
      prompt
    }:\n----------------------------\n> `;
    rl.question(decoratedPrompt, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
