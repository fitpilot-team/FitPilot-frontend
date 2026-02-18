import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAIStore } from '../../../store/aiStore';

export const PersonalInfoStep: React.FC = () => {
  const { t } = useTranslation('ai');
  const { answers, setAnswer } = useAIStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {t('personal.title')}
        </h2>
        <p className="text-gray-600">
          {t('personal.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="document_id">
            {t('personal.document_id')}
          </label>
          <input
            id="document_id"
            type="text"
            value={answers.document_id || ''}
            onChange={(e) => setAnswer('document_id', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
            {t('personal.phone')}
          </label>
          <input
            id="phone"
            type="text"
            value={answers.phone || ''}
            onChange={(e) => setAnswer('phone', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
          {t('personal.address')}
        </label>
        <textarea
          id="address"
          value={answers.address || ''}
          onChange={(e) => setAnswer('address', e.target.value || undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="emergency_contact_name">
            {t('personal.emergency_contact_name')}
          </label>
          <input
            id="emergency_contact_name"
            type="text"
            value={answers.emergency_contact_name || ''}
            onChange={(e) => setAnswer('emergency_contact_name', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="emergency_contact_phone">
            {t('personal.emergency_contact_phone')}
          </label>
          <input
            id="emergency_contact_phone"
            type="text"
            value={answers.emergency_contact_phone || ''}
            onChange={(e) => setAnswer('emergency_contact_phone', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="insurance_provider">
            {t('personal.insurance_provider')}
          </label>
          <input
            id="insurance_provider"
            type="text"
            value={answers.insurance_provider || ''}
            onChange={(e) => setAnswer('insurance_provider', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="policy_number">
            {t('personal.policy_number')}
          </label>
          <input
            id="policy_number"
            type="text"
            value={answers.policy_number || ''}
            onChange={(e) => setAnswer('policy_number', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>
    </div>
  );
};
