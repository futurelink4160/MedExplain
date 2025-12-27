import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  age: number | null;
  gender: string | null;
  preferred_role: string | null;
  notification_preferences: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled';
  queries_per_month_limit: number;
  queries_used_this_month: number;
  billing_period_start: string;
  billing_period_end: string;
  created_at: string;
  updated_at: string;
}

export interface UserRecommendation {
  id: string;
  user_id: string;
  recommendation_type: 'medication' | 'gene' | 'guideline' | 'interaction' | 'educational';
  title: string;
  description: string;
  related_medication: string | null;
  related_gene: string | null;
  priority: number;
  is_dismissed: boolean;
  created_at: string;
}

export interface QueryHistoryItem {
  id: string;
  user_id: string;
  medication: string | null;
  question: string | null;
  symptoms: string | null;
  response_data: {
    urgency_level?: string;
    emergency_detected?: boolean;
    response_type?: string;
  };
  created_at: string;
}

export interface HealthInsight {
  type: 'medication' | 'category' | 'urgency' | 'gene' | 'symptom';
  title: string;
  value: string | number;
  description: string;
  icon: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

export async function createUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .insert([{ user_id: userId, ...profileData }])
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return data;
}

export async function updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(profileData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return data;
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user subscription:', error);
    return null;
  }

  if (!data) {
    const { data: newSub, error: createError } = await supabase
      .from('user_subscriptions')
      .insert([{
        user_id: userId,
        plan_type: 'free',
        status: 'active',
        queries_per_month_limit: 50,
        queries_used_this_month: 0,
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user subscription:', createError);
      return null;
    }

    return newSub;
  }

  return data;
}

export async function getQueryHistory(userId: string, limit: number = 10): Promise<QueryHistoryItem[]> {
  const { data, error } = await supabase
    .from('query_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching query history:', error);
    return [];
  }

  return data || [];
}

export async function getUserRecommendations(userId: string): Promise<UserRecommendation[]> {
  const { data, error } = await supabase
    .from('user_recommendations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_dismissed', false)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching user recommendations:', error);
    return [];
  }

  return data || [];
}

export async function dismissRecommendation(recommendationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_recommendations')
    .update({ is_dismissed: true })
    .eq('id', recommendationId);

  if (error) {
    console.error('Error dismissing recommendation:', error);
    return false;
  }

  return true;
}

export async function analyzeHealthInsights(userId: string): Promise<HealthInsight[]> {
  const history = await getQueryHistory(userId, 50);
  const insights: HealthInsight[] = [];

  if (history.length === 0) {
    return insights;
  }

  const medicationCount: Record<string, number> = {};
  const urgencyCount: Record<string, number> = {};
  const genePattern: string[] = [];

  history.forEach(item => {
    if (item.medication) {
      medicationCount[item.medication] = (medicationCount[item.medication] || 0) + 1;
    }

    const urgency = item.response_data?.urgency_level || 'moderate';
    urgencyCount[urgency] = (urgencyCount[urgency] || 0) + 1;
  });

  const topMedications = Object.entries(medicationCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  if (topMedications.length > 0) {
    const [medication, count] = topMedications[0];
    insights.push({
      type: 'medication',
      title: 'Most Queried Medication',
      value: medication,
      description: `You've inquired about this medication ${count} time${count > 1 ? 's' : ''}`,
      icon: 'Pill',
    });
  }

  const highUrgencyCount = urgencyCount['high'] || 0;
  if (highUrgencyCount > 0) {
    insights.push({
      type: 'urgency',
      title: 'High Priority Inquiries',
      value: highUrgencyCount,
      description: `${highUrgencyCount} high-urgency question${highUrgencyCount > 1 ? 's' : ''} detected`,
      icon: 'AlertCircle',
    });
  }

  insights.push({
    type: 'category',
    title: 'Total Inquiries',
    value: history.length,
    description: 'Inquiries made in your history',
    icon: 'MessageSquare',
  });

  return insights;
}

export async function generateRecommendations(userId: string): Promise<void> {
  const history = await getQueryHistory(userId, 20);

  if (history.length === 0) {
    return;
  }

  const medicationCount: Record<string, number> = {};

  history.forEach(item => {
    if (item.medication) {
      medicationCount[item.medication] = (medicationCount[item.medication] || 0) + 1;
    }
  });

  const topMedications = Object.entries(medicationCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  const recommendations: Omit<UserRecommendation, 'id' | 'created_at'>[] = [];

  if (topMedications.length > 0) {
    const [medication] = topMedications[0];
    recommendations.push({
      user_id: userId,
      recommendation_type: 'interaction',
      title: `Check Drug Interactions for ${medication}`,
      description: `Based on your frequent inquiries about ${medication}, you might want to check potential drug interactions with other medications.`,
      related_medication: medication,
      related_gene: null,
      priority: 10,
      is_dismissed: false,
    });

    recommendations.push({
      user_id: userId,
      recommendation_type: 'educational',
      title: `Learn More About ${medication}`,
      description: `Explore comprehensive pharmacogenomic information and clinical guidelines related to ${medication}.`,
      related_medication: medication,
      related_gene: null,
      priority: 8,
      is_dismissed: false,
    });
  }

  recommendations.push({
    user_id: userId,
    recommendation_type: 'guideline',
    title: 'Explore CPIC Guidelines',
    description: 'Review Clinical Pharmacogenetics Implementation Consortium guidelines for evidence-based recommendations.',
    related_medication: null,
    related_gene: null,
    priority: 5,
    is_dismissed: false,
  });

  const existingRecs = await getUserRecommendations(userId);
  const existingTitles = new Set(existingRecs.map(r => r.title));

  const newRecommendations = recommendations.filter(
    rec => !existingTitles.has(rec.title)
  );

  if (newRecommendations.length > 0) {
    const { error } = await supabase
      .from('user_recommendations')
      .insert(newRecommendations);

    if (error) {
      console.error('Error generating recommendations:', error);
    }
  }
}

export function downloadRecommendationsAsText(recommendations: UserRecommendation[], userName: string): void {
  const date = new Date().toLocaleDateString();
  let content = `MedExplain - Personalized Recommendations\n`;
  content += `Generated for: ${userName}\n`;
  content += `Date: ${date}\n`;
  content += `\n${'='.repeat(60)}\n\n`;

  recommendations.forEach((rec, index) => {
    content += `${index + 1}. ${rec.title}\n`;
    content += `   Type: ${rec.recommendation_type.charAt(0).toUpperCase() + rec.recommendation_type.slice(1)}\n`;
    content += `   ${rec.description}\n`;

    if (rec.related_medication) {
      content += `   Related Medication: ${rec.related_medication}\n`;
    }
    if (rec.related_gene) {
      content += `   Related Gene: ${rec.related_gene}\n`;
    }

    content += `\n`;
  });

  content += `\n${'='.repeat(60)}\n`;
  content += `\nThank you for using MedExplain!\n`;
  content += `For more information, visit your dashboard.\n`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medexplain-recommendations-${date.replace(/\//g, '-')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
