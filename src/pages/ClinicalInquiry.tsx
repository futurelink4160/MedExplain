import Layout from '../components/Layout';
import InquiryForm from '../components/InquiryForm';

export default function ClinicalInquiry() {
  return (
    <Layout>
      <InquiryForm
        defaultRole="Clinician"
        pageTitle="Clinical Professional Inquiry"
        pageSubtitle="Access clinical-level pharmacogenomic insights for healthcare professionals"
        allowedRoles={['Doctor', 'Clinician']}
      />
    </Layout>
  );
}
