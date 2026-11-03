import {ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View} from 'react-native';
import {useEffect, useState} from "react";
import {MATCHES_URL} from "../config";

// Экран «Матчи тура» — задание в README.md, часть 1.

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Дата не назначена';

  // new Date() автоматически переводит строку UTC (Z на конце) в локальный часовой пояс устройства
  const date = new Date(dateString);

  return date.toLocaleString([], {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export function MatchesScreen() {
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const statusNames: Record<string, string> = {
    finished: 'Завершён',
    scheduled: 'Предстоящий',
    live: 'В эфире',
    postponed: 'Перенесён',
  }
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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{marginTop: 10, textAlign: 'center', fontSize: 24}}>Загрузка матчей...</Text>
      </View>
    )
  }
  if (matches.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{marginTop: 10, textAlign: 'center', fontSize: 24}}>Матчи отсутствуют, попробуйте позже </Text>
      </View>
    )
  }
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{marginTop: 10, textAlign: 'center', fontSize: 24}}>Ошибка при загрузке матчей</Text>
        <Pressable onPress={() => fetchData()}>
          <Text
            style={{
              marginTop: 10,
              padding:10,
              color: '#fff',
              backgroundColor: '#000',
              textAlign: 'center',
              fontSize: 24,
              maxWidth: 200,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center'
            }}
          >Повторить</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура</Text>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={{paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc'}}>
            <Text style={{fontWeight: 'bold'}}>
              {item.home.name} — {item.away.name}
            </Text>
            <Text>
              {item.score !== null && item.score !== undefined
                ? `Счёт: ${item.score?.home} : ${item.score?.away}`
                : 'Счёт: ещё не сыгран'}

            </Text>
            <Text>{formatDate(item.startsAt)}</Text>
            <Text>Статус: {statusNames[item.status]}</Text>
          </View>
        )}
      />
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
