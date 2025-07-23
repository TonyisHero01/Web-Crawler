import { SideSheet, Typography, List } from '@douyinfe/semi-ui';

export default function PageDetailSheet({ visible, onClose, pageDetail }) {
  const { Title } = Typography;

  return (
    <SideSheet title="Page Detail" visible={visible} onCancel={onClose}>
      {pageDetail && (
        <>
          <Title>{pageDetail.title}</Title>
          <div>{pageDetail.url}</div>
          <div>{pageDetail.time?.slice(0, 19)}</div>
          <List
            header="Links"
            dataSource={pageDetail.links}
            renderItem={item => <List.Item>{item}</List.Item>}
          />
        </>
      )}
    </SideSheet>
  );
}