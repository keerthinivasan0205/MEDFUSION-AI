import { Stethoscope } from 'lucide-react';
import PredictionLayout from '../components/PredictionLayout';

const tips = [
  'Upload a frontal chest X-ray (PA view preferred)',
  'Ensure the image is not rotated or cropped',
  'DICOM exports converted to PNG/JPG work best',
  'Higher resolution yields better accuracy',
];

export default function Xray() {
  return <PredictionLayout title="X-Ray Analysis" endpoint="xray" icon={Stethoscope} color="#00d4ff" tips={tips} />;
}
