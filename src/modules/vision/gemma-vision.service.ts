import {
  Injectable,
  Logger,
  ServiceUnavailableException,
  InternalServerErrorException,
} from '@nestjs/common';
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
  private ai: GoogleGenerativeAI;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMMA_API_KEY');
    if (!apiKey) {
      throw new Error('GEMMA_API_KEY is not defined in environment variables.');
    }
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  async analyzeCloud(
    buffer: Buffer,
    mimeType: string,
  ): Promise<CloudAnalysisResult> {
    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-flash-lite-latest',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const prompt = `
Analyze this uploaded sky/cloud image carefully based on its actual visual features.
Return a JSON object with these exact keys:
- "imaginedShape": A creative, playful shape, creature, or object that these specific clouds look like (pareidolia).
- "cloudType": A short everyday English label (2-4 words) describing the clouds. Do NOT use Latin/scientific words. Pick the best fit from: ["Fair-weather puffs", "Puffy clouds", "Towering puffs", "Thundercloud", "Low grey sheet", "Lumpy low layer", "Rain layer", "Mid-level veil", "Mid-level heaps", "High wisps", "High milky veil", "Mackerel sky"].
- "weatherForecast": A short 1-sentence outdoor weather prediction for the next 2-4 hours based on what you see in the sky.
- "poeticLore": A relaxing 2-sentence poetic observation inviting the user to lie down in the grass and watch this specific sky.
`;

      const imagePart = {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text().trim();

      return JSON.parse(text) as CloudAnalysisResult;
    } catch (err: any) {
      this.logger.error(
        `Gemini Vision analysis failed: ${err.message}`,
        err.stack,
      );

      // Pass clear HTTP status codes to client instead of masking with dummy data
      if (err.status === 503 || err.message?.includes('503')) {
        throw new ServiceUnavailableException(
          'Sky analysis model is currently experiencing high demand. Please try again shortly.',
        );
      }

      throw new InternalServerErrorException(
        `Failed to analyze sky image: ${err.message || 'Unknown error'}`,
      );
    }
  }
}
