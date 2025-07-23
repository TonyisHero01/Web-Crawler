import { RadioGroup, Radio } from '@douyinfe/semi-ui';
import { CrawlMode } from '../constants';

export default function ModeToggle({ mode, onChange }) {
  return (
    <RadioGroup type="button" value={mode} onChange={onChange}>
      <Radio value={CrawlMode.ACTIVE}>Active</Radio>
      <Radio value={CrawlMode.INACTIVE}>Inactive</Radio>
    </RadioGroup>
  );
}