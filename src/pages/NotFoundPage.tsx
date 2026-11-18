import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Такой страницы нет."
      extra={
        <Button type="primary" onClick={() => navigate('/')}>
          На дашборд
        </Button>
      }
    />
  );
}
