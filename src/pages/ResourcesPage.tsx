import { Card, Result, Space, Spin, Typography } from 'antd';
import { useChapters } from '../data/useChapters';
import { BlockList } from '../components/BlockList';
import { useProgram } from '../ProgramContext';

/** Полезные ресурсы текущего направления. */
export function ResourcesPage() {
  const { def } = useProgram();
  const { chapters, error } = useChapters([def.resourcesChapter]);

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <div className="page-head">
        <Typography.Title level={3} style={{ marginBottom: 4 }}>
          Полезные ресурсы
        </Typography.Title>
        <Typography.Text type="secondary">
          Документация первичного источника, инструменты и порядок работы с программой
        </Typography.Text>
      </div>

      {error && <Result status="error" title="Не удалось загрузить ресурсы" subTitle={error} />}
      {!chapters && !error && (
        <div className="loading-center">
          <Spin size="large" description="Загрузка ресурсов…" />
        </div>
      )}
      {chapters && (
        <Card className="chapter-block" title={chapters[0].title}>
          <BlockList blocks={chapters[0].blocks} />
        </Card>
      )}
    </Space>
  );
}
