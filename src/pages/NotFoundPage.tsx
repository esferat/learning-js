import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useProgram } from '../ProgramContext';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { def } = useProgram();
  return (
    <Result
      status="404"
      title="404"
      subTitle="Такой страницы нет."
      extra={
        <Button type="primary" onClick={() => navigate(def.path)}>
          На дашборд
        </Button>
      }
    />
  );
}
