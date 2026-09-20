/**
 * react-native-in-app-review 鸿蒙 Example
 *
 * 覆盖库的全部 3 个公开 API：
 *   1. InAppReview.isAvailable()                能力查询（同步）
 *   2. InAppReview.RequestInAppReview()         应用内评分弹窗
 *   3. InAppReview.requestInAppCommentAppGallery()  应用市场应用内评论
 * 以及内部降级路径演示（不属公开 API）：
 *   4. openAppGalleryDetailPage()               拉起应用市场详情页手动评分
 *
 * 所有结果均为真实调用返回：resolve 值 / reject 的 code+message 原样展示在结果面板。
 * 说明：应用内评论弹窗不支持模拟器，且真机需应用已上架 AppGallery 并登录华为账号，
 * 错误分支（1021500001~1021500009）本身即有效验证面。
 */
import React, {useCallback, useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Platform, TurboModuleRegistry} from 'react-native';
import InAppReview from 'react-native-in-app-review';

type LogKind = 'info' | 'success' | 'error';

interface LogEntry {
  id: number;
  time: string;
  title: string;
  detail: string;
  kind: LogKind;
}

/** 内部降级能力（未进入 InAppReview 公开面），Example 直接取 TurboModule 演示 */
interface NativeInAppReviewInternal {
  openAppGalleryDetailPage(): Promise<boolean>;
}

const nativeInAppReviewModule = TurboModuleRegistry.get(
  'InAppReviewModule',
) as unknown as NativeInAppReviewInternal | null;

/** 原样展示 reject 的 code + message（跨桥形状：{code: string, message: string}） */
function formatError(error: unknown): string {
  if (error !== null && typeof error === 'object') {
    const e = error as {code?: unknown; message?: unknown};
    const hasCode = e.code !== undefined;
    const hasMessage = e.message !== undefined;
    if (hasCode || hasMessage) {
      return [
        `code: ${hasCode ? String(e.code) : '(none)'}`,
        `message: ${hasMessage ? String(e.message) : '(none)'}`,
      ].join('\n');
    }
  }
  return String(error);
}

function now(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function App(): JSX.Element {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [available, setAvailable] = useState<boolean>(InAppReview.isAvailable());

  const addLog = useCallback(
    (title: string, detail: string, kind: LogKind) => {
      setLogs(prev => [
        {id: prev.length + 1, time: now(), title, detail, kind},
        ...prev,
      ]);
    },
    [],
  );

  /** 运行一个 Promise 型 API：undefined（平台不支持）与 resolve/reject 都展示真实值 */
  const runPromiseApi = useCallback(
    (title: string, promise: Promise<boolean> | undefined) => {
      if (promise === undefined) {
        addLog(title, 'returned undefined（当前平台/模块不可用）', 'info');
        return;
      }
      promise
        .then(result => {
          addLog(`${title} → resolve`, `value: ${String(result)}`, 'success');
        })
        .catch((error: unknown) => {
          addLog(`${title} → reject`, formatError(error), 'error');
        });
    },
    [addLog],
  );

  const onPressRefreshAvailability = useCallback(() => {
    try {
      const value = InAppReview.isAvailable();
      setAvailable(value);
      addLog('isAvailable()', `value: ${String(value)}`, value ? 'success' : 'info');
    } catch (error) {
      addLog('isAvailable() → throw', formatError(error), 'error');
    }
  }, [addLog]);

  const onPressRequestInAppReview = useCallback(() => {
    try {
      runPromiseApi('RequestInAppReview()', InAppReview.RequestInAppReview());
    } catch (error) {
      addLog('RequestInAppReview() → throw', formatError(error), 'error');
    }
  }, [addLog, runPromiseApi]);

  const onPressRequestInAppComment = useCallback(() => {
    try {
      runPromiseApi(
        'requestInAppCommentAppGallery()',
        InAppReview.requestInAppCommentAppGallery(),
      );
    } catch (error) {
      addLog('requestInAppCommentAppGallery() → throw', formatError(error), 'error');
    }
  }, [addLog, runPromiseApi]);

  const onPressOpenDetailPage = useCallback(() => {
    if (!nativeInAppReviewModule) {
      addLog(
        'openAppGalleryDetailPage()',
        'TurboModule InAppReviewModule 未注册（autolinking 失败）',
        'error',
      );
      return;
    }
    runPromiseApi(
      'openAppGalleryDetailPage()【内部降级路径】',
      nativeInAppReviewModule.openAppGalleryDetailPage(),
    );
  }, [addLog, runPromiseApi]);

  const kindColor = (kind: LogKind): string =>
    kind === 'success' ? '#2e7d32' : kind === 'error' ? '#c62828' : '#555555';

  const kindLabel = (kind: LogKind): string =>
    kind === 'success' ? '成功' : kind === 'error' ? '错误' : '信息';

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>InAppReview 鸿蒙适配 Demo</Text>
        <Text style={styles.subtitle}>
          platform: {Platform.OS}（harmony）
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>
            应用内评论弹窗能力 isAvailable()：
            <Text style={available ? styles.statusOn : styles.statusOff}>
              {available ? ' true' : ' false'}
            </Text>
          </Text>
          {!available && (
            <Text style={styles.statusHint}>
              当前设备不支持应用内评论弹窗（需 HarmonyOS 6.0.0/API 20+ 的
              AppGallery 评论服务）。此时 RequestInAppReview /
              requestInAppCommentAppGallery 将走错误分支（code '21'），
              可用下方降级路径拉起应用市场详情页手动评分。
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={onPressRefreshAvailability}
          testID="btn-isAvailable">
          <Text style={styles.buttonText}>1. isAvailable() 能力查询</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onPressRequestInAppReview}
          testID="btn-request-review">
          <Text style={styles.buttonText}>2. RequestInAppReview() 应用内评分</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onPressRequestInAppComment}
          testID="btn-request-comment">
          <Text style={styles.buttonText}>
            3. requestInAppCommentAppGallery() 应用市场评论
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={onPressOpenDetailPage}
          testID="btn-open-detail">
          <Text style={styles.buttonSecondaryText}>
            4. 降级：openAppGalleryDetailPage() 详情页手动评分（内部 API）
          </Text>
        </TouchableOpacity>

        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>结果面板（真实返回值）</Text>
          {logs.length > 0 && (
            <TouchableOpacity onPress={() => setLogs([])} testID="btn-clear">
              <Text style={styles.clearText}>清空</Text>
            </TouchableOpacity>
          )}
        </View>

        {logs.length === 0 ? (
          <Text style={styles.empty}>尚无调用记录，点击上方按钮开始</Text>
        ) : (
          logs.map(entry => (
            <View
              key={entry.id}
              style={styles.logItem}
              testID={`log-item-${entry.id}`}>
              <View style={styles.logHead}>
                <Text style={[styles.logKind, {color: kindColor(entry.kind)}]}>
                  [{kindLabel(entry.kind)}]
                </Text>
                <Text style={styles.logTime}>{entry.time}</Text>
              </View>
              <Text style={styles.logTitle}>{entry.title}</Text>
              <Text style={[styles.logDetail, {color: kindColor(entry.kind)}]}>
                {entry.detail}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f6f8',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 13,
    color: '#666666',
    marginTop: 4,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 14,
    color: '#333333',
  },
  statusOn: {
    fontWeight: '700',
    color: '#2e7d32',
  },
  statusOff: {
    fontWeight: '700',
    color: '#c62828',
  },
  statusHint: {
    fontSize: 12,
    color: '#7a7a7a',
    marginTop: 8,
    lineHeight: 18,
  },
  button: {
    backgroundColor: '#2f6fed',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#e8eefc',
  },
  buttonSecondaryText: {
    color: '#2f6fed',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 6,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  clearText: {
    fontSize: 13,
    color: '#2f6fed',
  },
  empty: {
    fontSize: 13,
    color: '#999999',
    paddingVertical: 16,
    textAlign: 'center',
  },
  logItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  logHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logKind: {
    fontSize: 12,
    fontWeight: '700',
  },
  logTime: {
    fontSize: 11,
    color: '#999999',
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    marginTop: 4,
  },
  logDetail: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
});

export default App;
