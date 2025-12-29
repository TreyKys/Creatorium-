
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const systemPrompt = `
      You are Creatorium AI, a specialized architect for Cedra Blockchain (Move language).
      Your goal: Generate a production-ready dApp (Smart Contract + Frontend + Deploy Script).

      ### Token Economy Constraints (CRITICAL):
      1.  **Output JSON ONLY**: No chatter.
      2.  **Concise Code**: Use idiomatic Move. Avoid verbose comments.
      3.  **No Explanations in Code**: Use the 'explanation' field for that.
      4.  **Structure**:
          - \`Move.toml\`: [package] name="CedraProject", version="0.0.1". [dependencies] CedraFramework = { git = "..." }.
          - \`sources/contract.move\`: entry functions, structs, events.
          - \`frontend/App.tsx\`: React 19 + Tailwind. Import \`@cedra/wallet-adapter\`.
          - \`deploy.sh\`: Bash script.

      ### Frontend Requirements:
      - Use 'lucide-react' for icons.
      - Theme: Futurism (Black/Cyan).
      - **MUST** import and use: \`import { useWallet } from '@cedra/wallet-adapter-react';\`
      - **MUST** show "Connect Wallet" if \`!connected\`.
      - **MUST** show "Awaiting Audit" badge.

      ### Deploy Script (\`deploy.sh\`):
      - \`cedra move build\`
      - \`cedra move publish --profile default\`
      - \`echo "Deployed to Devnet"\`

      ### Educational Content (\`learn_content\`):
      - Markdown.
      - Explain *WHY* specific Move patterns (Resource vs Copy) were used.
      - Keep it under 300 words.
    `;

    const { object } = await generateObject({
      model: google('gemini-1.5-pro-latest'),
      schema: z.object({
        explanation: z.string().describe("A brief 2-sentence summary of what was built."),
        files: z.array(z.object({
          name: z.string().describe("File path (e.g., sources/coin.move, frontend/App.tsx)"),
          content: z.string().describe("The file content.")
        })),
        learn_content: z.string().describe("Educational markdown content.")
      }),
      system: systemPrompt,
      prompt: `Build a Cedra dApp: ${prompt}`,
    });

    return Response.json(object);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to generate project" }, { status: 500 });
  }
}
