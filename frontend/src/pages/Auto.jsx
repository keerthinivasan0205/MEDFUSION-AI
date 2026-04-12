import { Zap } from 'lucide-react';
import PredictionLayout from '../components/PredictionLayout';

const tips = [
  'Upload any medical image — AI will classify it automatically',
  'Supports skin lesions, chest X-rays, and bone X-rays',
  'The system selects the best model for your image',
  'Ideal for quick triage and unknown image types',
];

export default function Auto() {
  return <PredictionLayout title="Auto Detection" endpoint="auto" icon={Zap} color="#a78bfa" tips={tips} />;
}
