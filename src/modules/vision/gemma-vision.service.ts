import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface CloudAnalysisResult {
  imaginedShape: string;
  cloudType: string;
  weatherForecast: string;
  poeticLore: string;
}

@Injectable()
export class GemmaVisionService {
  private readonly logger = new Logger(GemmaVisionService.name);
  private ai: GoogleGenerativeAI | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMMA_API_KEY');
    if (apiKey) {
      this.ai = new GoogleGenerativeAI(apiKey);
    } else {
      this.logger.warn(
        'GEMMA_API_KEY not configured. Mock analysis will be used.',
      );
    }
  }

  async analyzeCloud(
    buffer: Buffer,
    mimeType: string,
  ): Promise<CloudAnalysisResult> {
    const fallback: CloudAnalysisResult = {
      imaginedShape: 'A fluffy rabbit bounding across a calm summer sky',
      cloudType: 'Cumulus humilis',
      weatherForecast:
        'Clear, gentle afternoon conditions for the next few hours.',
      poeticLore:
        'Soft edges shifting in the light. Take a slow breath and watch the drift.',
    };

    if (!this.ai) {
      return fallback;
    }

    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-flash-latest',
      });

      const prompt = `
Analyze this photo of the sky/clouds. Return strictly a raw JSON object (without markdown code blocks) with keys:
- "imaginedShape": A creative, witty description of what shape/creature/object the clouds resemble (pareidolia).
- "cloudType": Scientific cloud classification (e.g., Altocumulus, Cirrus fibratus, Cumulus humilis).
- "weatherForecast": A short 1-sentence outdoor weather prediction for the next 2-4 hours based on these clouds.
- "poeticLore": A relaxing 2-sentence poetic observation inviting the user to lie down in the grass and watch them.
`;

      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType,
        },
      };

      const response = await model.generateContent([prompt, imagePart]);
      const text = response.response
        .text()
        .trim()
        .replace(/```json|```/g, '');
      return JSON.parse(text) as CloudAnalysisResult;
    } catch (err: any) {
      this.logger.error(
        `AI model call failed (${err.message}). Falling back to default analysis.`,
      );
      return fallback;
    }
  }
}
