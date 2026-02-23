import { useState } from 'react';
import AppLayout from '../../components/layout/AppLayout';
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Step1BasicDetails } from './steps/Step1BasicDetails';
import { Step2Expenses } from './steps/Step2Expenses';
import { Step3Insurance } from './steps/Step3Insurance';
import { Step4Investments } from './steps/Step4Investments';
import { Step5Assets } from './steps/Step5Assets';
import { Step6Goals } from './steps/Step6Goals';
import { Step7LifeEvents } from './steps/Step7LifeEvents';
import { Step8Summary } from './steps/Step8Summary';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function EventsCalculator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Details & Income
    familyMode: 'individual',
    fullName: '',
    age: '',
    city: '',
    retirementAge: '',
    maritalStatus: '',
    husbandName: '',
    wifeName: '',
    husbandAge: '',
    wifeAge: '',
    cityCouple: '',
    husbandRetirementAge: '',
    wifeRetirementAge: '',
    incomes: [],

    // Step 2: Expenses
    expenses: [],

    // Step 3: Insurance
    insurances: [],

    // Step 4: Investments
    investments: [],

    // Step 5: Assets & Liabilities
    assets: [],
    liabilities: [],

    // Step 6: Financial Goals
    goals: [],

    // Step 7: Life Events
    lifeEvents: [],

    // Step 8: Summary & Results
    snapshot: null
  });

  const totalSteps = 8;

  const steps = [
    { number: 1, title: 'Basic Details & Income', component: Step1BasicDetails },
    { number: 2, title: 'Monthly Expenses', component: Step2Expenses },
    { number: 3, title: 'Insurance Coverage', component: Step3Insurance },
    { number: 4, title: 'Current Investments', component: Step4Investments },
    { number: 5, title: 'Assets & Liabilities', component: Step5Assets },
    { number: 6, title: 'Financial Goals', component: Step6Goals },
    { number: 7, title: 'Life Events Planning', component: Step7LifeEvents },
    { number: 8, title: 'Summary & Results', component: Step8Summary }
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepNumber) => {
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateFormData = (stepData) => {
    setFormData(prev => ({
      ...prev,
      ...stepData
    }));
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <AppLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">8 Events Calculator</h1>
          <p className="text-gray-600">Plan your financial future across 8 major life events</p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-6">
          <CardContent className="p-4">
            {/* Desktop: Horizontal Steps */}
            <div className="hidden md:flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <button
                    onClick={() => handleStepClick(step.number)}
                    className={`flex flex-col items-center transition-all ${
                      currentStep >= step.number ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                    }`}
                    disabled={currentStep < step.number}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mb-2 transition-all ${
                      currentStep === step.number
                        ? 'bg-emerald-600 text-white shadow-lg scale-110'
                        : currentStep > step.number
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step.number}
                    </div>
                    <span className={`text-xs text-center font-medium ${
                      currentStep === step.number ? 'text-emerald-600' : 'text-gray-600'
                    }`}>
                      {step.title}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                      currentStep > step.number ? 'bg-emerald-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile: Compact Progress */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-emerald-600">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
              <p className="text-sm font-medium text-gray-900 mt-3">{steps[currentStep - 1].title}</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {currentStep === 1 && 'Provide your basic details and income sources'}
              {currentStep === 2 && 'List your monthly household and lifestyle expenses'}
              {currentStep === 3 && 'Review your insurance coverage and protection'}
              {currentStep === 4 && 'Detail your current investment portfolio'}
              {currentStep === 5 && 'Add your assets, properties, and liabilities'}
              {currentStep === 6 && 'Define your financial goals and aspirations'}
              {currentStep === 7 && 'Plan for major life events and milestones'}
              {currentStep === 8 && 'Review your complete financial snapshot'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrentStepComponent
              formData={formData}
              updateFormData={updateFormData}
            />
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-4 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="text-sm text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={currentStep === totalSteps}
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">{currentStep === totalSteps ? 'Finish' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
