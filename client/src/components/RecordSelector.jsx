import { Select } from '@douyinfe/semi-ui';

export default function RecordSelector({ records, selectedId, onChange }) {
  return (
    <Select
      value={selectedId}
      onChange={onChange}
      placeholder="Select a record"
      style={{ width: 320 }}
    >
      {(records || []).map(r => (
        <Select.Option key={r.id} value={r.id}>
          {r.label}
        </Select.Option>
      ))}
    </Select>
  );
}