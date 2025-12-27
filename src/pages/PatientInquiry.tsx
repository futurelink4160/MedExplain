import Layout from '../components/Layout';
import InquiryForm from '../components/InquiryForm';

export default function PatientInquiry() {
  return (
    <Layout>
      <InquiryForm
        defaultRole="Patient"
        pageTitle="Patient & Caregiver Inquiry"
        pageSubtitle="Get personalized medication insights for patients and caregivers"
        allowedRoles={['Patient', 'Caregiver']}
      />
    </Layout>
  );
}
