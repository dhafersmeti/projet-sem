import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LoginPage                       from './pages/LoginPage'
import DashboardPage                   from './pages/DashboardPage'
import CandidatesPage                  from './pages/candidates/CandidatesPage'
import CandidateFormPage               from './pages/candidates/CandidateFormPage'
import CandidateDetailPage             from './pages/candidates/CandidateDetailPage'
import JobOffersPage                   from './pages/joboffers/JobOffersPage'
import JobOfferFormPage                from './pages/joboffers/JobOfferFormPage'
import ApplicationsPage                from './pages/applications/ApplicationsPage'
import ApplicationFormPage             from './pages/applications/ApplicationFormPage'
import InterviewsPage                  from './pages/interviews/InterviewsPage'
import InterviewFormPage               from './pages/interviews/InterviewFormPage'
import EvaluationPage                  from './pages/interviews/EvaluationPage'
import ChangePasswordPage              from './pages/portal/ChangePasswordPage'

import PortalHomePage                  from './pages/portal/PortalHomePage'
import PortalProfilePage               from './pages/portal/PortalProfilePage'
import PortalApplicationPage           from './pages/portal/PortalApplicationPage'
import PortalInterviewsPage            from './pages/portal/PortalInterviewsPage'
import PortalNotificationsPage         from './pages/portal/PortalNotificationsPage'
import PortalOfferPage                 from './pages/portal/PortalOfferPage'

const STAFF     = ['ADMIN', 'RECRUITER']
const CANDIDATE = ['CANDIDATE']
const ALL_AUTH  = ['ADMIN', 'RECRUITER', 'CANDIDATE']

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />

        {/* Changement de mot de passe (staff + candidat) */}
        <Route path="/change-password"         element={<ProtectedRoute allowedRoles={STAFF}><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/portal/change-password"  element={<ProtectedRoute allowedRoles={CANDIDATE}><ChangePasswordPage /></ProtectedRoute>} />

        {/* Routes staff (admin + recruteur) */}
        <Route path="/"        element={<ProtectedRoute allowedRoles={STAFF}><DashboardPage /></ProtectedRoute>} />
<Route path="/candidates"           element={<ProtectedRoute allowedRoles={STAFF}><CandidatesPage /></ProtectedRoute>} />
        <Route path="/candidates/new"       element={<ProtectedRoute allowedRoles={STAFF}><CandidateFormPage /></ProtectedRoute>} />
        <Route path="/candidates/:id"       element={<ProtectedRoute allowedRoles={STAFF}><CandidateDetailPage /></ProtectedRoute>} />
        <Route path="/candidates/:id/edit"  element={<ProtectedRoute allowedRoles={STAFF}><CandidateFormPage /></ProtectedRoute>} />

        <Route path="/job-offers"           element={<ProtectedRoute allowedRoles={STAFF}><JobOffersPage /></ProtectedRoute>} />
        <Route path="/job-offers/new"       element={<ProtectedRoute allowedRoles={STAFF}><JobOfferFormPage /></ProtectedRoute>} />
        <Route path="/job-offers/:id/edit"  element={<ProtectedRoute allowedRoles={STAFF}><JobOfferFormPage /></ProtectedRoute>} />

        <Route path="/applications"         element={<ProtectedRoute allowedRoles={STAFF}><ApplicationsPage /></ProtectedRoute>} />
        <Route path="/applications/new"     element={<ProtectedRoute allowedRoles={STAFF}><ApplicationFormPage /></ProtectedRoute>} />

        <Route path="/interviews"              element={<ProtectedRoute allowedRoles={STAFF}><InterviewsPage /></ProtectedRoute>} />
        <Route path="/interviews/new"          element={<ProtectedRoute allowedRoles={STAFF}><InterviewFormPage /></ProtectedRoute>} />
        <Route path="/interviews/:id/evaluate" element={<ProtectedRoute allowedRoles={STAFF}><EvaluationPage /></ProtectedRoute>} />

        {/* Routes portail candidat */}
        <Route path="/portal"               element={<ProtectedRoute allowedRoles={CANDIDATE}><PortalHomePage /></ProtectedRoute>} />
        <Route path="/portal/profile"       element={<ProtectedRoute allowedRoles={CANDIDATE}><PortalProfilePage /></ProtectedRoute>} />
        <Route path="/portal/application"   element={<ProtectedRoute allowedRoles={CANDIDATE}><PortalApplicationPage /></ProtectedRoute>} />
        <Route path="/portal/interviews"    element={<ProtectedRoute allowedRoles={CANDIDATE}><PortalInterviewsPage /></ProtectedRoute>} />
        <Route path="/portal/notifications" element={<ProtectedRoute allowedRoles={CANDIDATE}><PortalNotificationsPage /></ProtectedRoute>} />
        <Route path="/portal/offer"         element={<ProtectedRoute allowedRoles={CANDIDATE}><PortalOfferPage /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
