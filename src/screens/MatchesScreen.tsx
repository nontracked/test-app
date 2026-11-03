import {StyleSheet, Text, View} from 'react-native';
import {useEffect, useState} from "react";
import {MATCHES_URL} from "../config";

// Экран «Матчи тура» — задание в README.md, часть 1.

export function MatchesScreen() {
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async (signal?: AbortSignal) => {
    try {
      const response = await fetch(MATCHES_URL, {signal})
      if (!response.ok) throw new Error('fetch error')
      const data = await response.json()
      console.table(data.matches)
      setMatches(data.matches || [])
    } catch (e: any) {
      if (e.name === 'AbortError') return
      setError(e.message || 'Error load matches')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => {
      controller.abort()
    }
  }, []);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
});
