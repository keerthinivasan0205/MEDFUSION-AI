import { Bone } from 'lucide-react';
import PredictionLayout from '../components/PredictionLayout';

const tips = [
  'Upload a clear bone X-ray image',
  'Ensure the full bone is visible in the frame',
  'Both AP and lateral views are supported',
  'Avoid overexposed or underexposed images',
];

export default function Fracture() {
  return <PredictionLayout title="Fracture Detection" endpoint="fracture" icon={Bone} color="#f59e0b" tips={tips} />;
}
