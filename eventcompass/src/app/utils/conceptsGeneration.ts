// app/utils/conceptsGeneration.ts

import { IntakeFormData, Concept } from '@/types/eventPlan';

interface GenerateConceptsResponse {
  success: boolean;
  concepts?: Concept[];
  path?: string;
  error?: string;
}

/**
 * Generate event concepts from intake form data using OpenAI
 * @param intakeFormData - The intake form data
 * @param path - The event planning path ('no-idea', 'rough-idea', 'solid-idea')
 * @returns Promise with generated concepts or error
 */
export async function generateConcepts(
  intakeFormData: IntakeFormData,
  path: 'no-idea' | 'rough-idea' | 'solid-idea'
): Promise<GenerateConceptsResponse> {
  try {
    const response = await fetch('/api/event-gen/concepts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intakeFormData,
        path
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate concepts');
    }

    return data;
  } catch (error) {
    console.error('Error generating concepts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Generate concepts with retry logic for better reliability
 * @param intakeFormData - The intake form data
 * @param path - The event planning path
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @returns Promise with generated concepts or error
 */
export async function generateConceptsWithRetry(
  intakeFormData: IntakeFormData,
  path: 'no-idea' | 'rough-idea' | 'solid-idea',
  maxRetries: number = 2
): Promise<GenerateConceptsResponse> {
  let lastError: string = '';
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const result = await generateConcepts(intakeFormData, path);
    
    if (result.success && result.concepts && result.concepts.length > 0) {
      return result;
    }
    
    lastError = result.error || 'No concepts generated';
    
    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  return {
    success: false,
    error: `Failed after ${maxRetries + 1} attempts. Last error: ${lastError}`
  };
}