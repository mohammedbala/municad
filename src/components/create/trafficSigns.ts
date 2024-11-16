import { useEffect, useState } from 'react';

export interface TrafficSign {
  id: string;
  name: string;
  category: string;
  url: string;
}

async function fetchSignsFromCategory(category: string): Promise<TrafficSign[]> {
  try {
    const response = await fetch(`https://api.github.com/repos/mohammedbala/municad_images/contents/${category}`);
    const data = await response.json();
    
    return data
      .filter((file: any) => file.name.endsWith('.svg'))
      .map((file: any) => ({
        id: file.name.replace('.svg', ''),
        name: file.name.replace('.svg', '').split('-').join(' ').toUpperCase(),
        category,
        url: `https://mohammedbala.github.io/municad_images/${category}/${file.name}`
      }));
  } catch (error) {
    console.error(`Error fetching signs from category ${category}:`, error);
    return [];
  }
}

export function useTrafficSigns() {
  const [signs, setSigns] = useState<TrafficSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllSigns() {
      try {
        setLoading(true);
        const categories = ['R', 'W', 'M']; // Regulatory, Warning, and Misc signs
        const allSigns = await Promise.all(
          categories.map(category => fetchSignsFromCategory(category))
        );
        
        setSigns(allSigns.flat());
        setError(null);
      } catch (err) {
        setError('Failed to load traffic signs');
        console.error('Error fetching traffic signs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAllSigns();
  }, []);

  return { signs, loading, error };
}