import { Microscope } from 'lucide-react';
import PredictionLayout from '../components/PredictionLayout';

const tips = [
  'Use clear, well-lit images of the skin lesion',
  'Ensure the lesion is centered and in focus',
  'Avoid blurry or low-resolution images',
  'Supported: PNG, JPG, JPEG',
];

export default function Skin() {
  return <PredictionLayout title="Skin Disease Detection" endpoint="skin" icon={Microscope} color="#ff6b9d" tips={tips} />;
}
