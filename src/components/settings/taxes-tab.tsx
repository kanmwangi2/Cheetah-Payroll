"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, AlertTriangle, Info, CheckCircle2 } from "lucide-react";
import { PAYE_BANDS as DEFAULT_PAYE_BANDS, PENSION_EMPLOYER_RATE as DEFAULT_PENSION_EMPLOYER_RATE, PENSION_EMPLOYEE_RATE as DEFAULT_PENSION_EMPLOYEE_RATE, MATERNITY_EMPLOYER_RATE as DEFAULT_MATERNITY_EMPLOYER_RATE, MATERNITY_EMPLOYEE_RATE as DEFAULT_MATERNITY_EMPLOYEE_RATE, CBHI_RATE as DEFAULT_CBHI_RATE, RAMA_EMPLOYER_RATE as DEFAULT_RAMA_EMPLOYER_RATE, RAMA_EMPLOYEE_RATE as DEFAULT_RAMA_EMPLOYEE_RATE } from "@/lib/taxConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSupabaseClientAsync } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useCompany } from '@/context/CompanyContext';



const getDefaultSettings = (companyId: string | null): TaxSettingsData => {
  const defaultValues = {
    payeBand1Limit: DEFAULT_PAYE_BANDS.BAND1_LIMIT,
    payeBand2Limit: DEFAULT_PAYE_BANDS.BAND2_LIMIT,
    payeBand3Limit: DEFAULT_PAYE_BANDS.BAND3_LIMIT,
    payeRate1: DEFAULT_PAYE_BANDS.RATE1 * 100,
    payeRate2: DEFAULT_PAYE_BANDS.RATE2 * 100,
    payeRate3: DEFAULT_PAYE_BANDS.RATE3 * 100,
    payeRate4: DEFAULT_PAYE_BANDS.RATE4 * 100,
    pensionEmployerRate: DEFAULT_PENSION_EMPLOYER_RATE * 100,
    pensionEmployeeRate: DEFAULT_PENSION_EMPLOYEE_RATE * 100,
    maternityEmployerRate: DEFAULT_MATERNITY_EMPLOYER_RATE * 100,
    maternityEmployeeRate: DEFAULT_MATERNITY_EMPLOYEE_RATE * 100,
    cbhiRate: DEFAULT_CBHI_RATE * 100,
    ramaEmployerRate: DEFAULT_RAMA_EMPLOYER_RATE * 100,
    ramaEmployeeRate: DEFAULT_RAMA_EMPLOYEE_RATE * 100,
  };

  if (companyId) {
    return {
      ...defaultValues,
      companyId: companyId,
    };
  }

  return defaultValues;
};



import { objectToSnakeCase, objectToCamelCase } from '@/lib/case-conversion';

export default function TaxesTab() {
  const { selectedCompanyId, isLoadingCompanyContext } = useCompany();
  const [settings, setSettings] = useState<TaxSettingsData>(() => getDefaultSettings(selectedCompanyId));
  const [isLoaded, setIsLoaded] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!selectedCompanyId || isLoadingCompanyContext) {
        if (!isLoadingCompanyContext) setIsLoaded(true);
        return;
      }
      setIsLoaded(false);
      setFeedback(null);
      try {
        const supabase = await getSupabaseClientAsync();
        const { data, error } = await supabase
          .from('tax_settings')
          .select('*')
          .eq('company_id', selectedCompanyId)
          .single();

        if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows found

        if (data) {
          setSettings(objectToCamelCase(data));
        } else {
          const defaultSettings = getDefaultSettings(selectedCompanyId);
          setSettings(defaultSettings);
          // No need to upsert here, let the user save explicitly
        }
      } catch (error) {
        console.error(`Error loading tax settings for company ${selectedCompanyId}:`, error);
        setSettings(getDefaultSettings(selectedCompanyId));
        setFeedback({ type: 'error', message: 'Error loading tax settings.', details: (error as Error).message });
      }
      setIsLoaded(true);
    };

    loadSettings();
  }, [selectedCompanyId, isLoadingCompanyContext]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFeedback(null);
    const { name, value } = e.target;
    const numValue = value === '' ? '' : parseFloat(value);
    setSettings(prev => ({ ...prev, [name]: numValue === '' ? 0 : numValue }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCompanyId) {
      setFeedback({ type: 'error', message: "No Company Selected", details: "Please select a company before saving settings." });
      return;
    }
    setFeedback(null);

    const numericSettings: Omit<TaxSettingsData, 'id' | 'companyId'> = {
        payeBand1Limit: Number(settings.payeBand1Limit) || 0,
        payeBand2Limit: Number(settings.payeBand2Limit) || 0,
        payeBand3Limit: Number(settings.payeBand3Limit) || 0,
        payeRate1: Number(settings.payeRate1) || 0,
        payeRate2: Number(settings.payeRate2) || 0,
        payeRate3: Number(settings.payeRate3) || 0,
        payeRate4: Number(settings.payeRate4) || 0,
        pensionEmployerRate: Number(settings.pensionEmployerRate) || 0,
        pensionEmployeeRate: Number(settings.pensionEmployeeRate) || 0,
        maternityEmployerRate: Number(settings.maternityEmployerRate) || 0,
        maternityEmployeeRate: Number(settings.maternityEmployeeRate) || 0,
        cbhiRate: Number(settings.cbhiRate) || 0,
        ramaEmployerRate: Number(settings.ramaEmployerRate) || 0,
        ramaEmployeeRate: Number(settings.ramaEmployeeRate) || 0,
    };

    const settingsToSave = {
      ...numericSettings,
      company_id: selectedCompanyId,
      id: settings.id, // Pass existing ID for upsert to work correctly
    };

    try {
      const supabase = await getSupabaseClientAsync();
      const { data, error } = await supabase.from('tax_settings').upsert(objectToSnakeCase(settingsToSave), { onConflict: 'company_id' }).select().single();

      if (error) throw error;

      if (data) {
        setSettings(objectToCamelCase(data));
      }
      
      setFeedback({ type: 'success', message: "Tax Settings Saved", details: `Tax configurations for the selected company have been saved.` });
    } catch (error) {
      console.error(`Error saving tax settings for company ${selectedCompanyId}:`, error);
      setFeedback({ type: 'error', message: "Save Failed", details: "Could not save tax settings." });
    }
  };

  const renderFeedbackMessage = () => {
    if (!feedback) return null;
    let IconComponent;
    let variant: "default" | "destructive" = "default";
    let additionalAlertClasses = "";

    switch (feedback.type) {
      case 'success':
        IconComponent = CheckCircle2;
        variant = "default";
        additionalAlertClasses = "bg-green-100 border-green-400 text-green-700 dark:bg-green-900/50 dark:text-green-300 dark:border-green-600 [&>svg]:text-green-600 dark:[&>svg]:text-green-400";
        break;
      case 'error':
        IconComponent = AlertTriangle;
        variant = "destructive";
        break;
      case 'info':
        IconComponent = Info;
        variant = "default";
        break;
      default:
        return null;
    }
    return (
      <Alert variant={variant} className={cn("mb-4", additionalAlertClasses)}>
        <IconComponent className="h-4 w-4" />
        <AlertTitle>{feedback.message}</AlertTitle>
        {feedback.details && <AlertDescription>{feedback.details}</AlertDescription>}
      </Alert>
    );
  };


  if (isLoadingCompanyContext || !isLoaded) {
      return <div className="flex justify-center items-center h-32"><Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading tax settings...</div>;
  }

  if (!selectedCompanyId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Global Tax Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="default" className={cn("mb-4")}>
            <Info className="h-4 w-4" />
            <AlertTitle>No Company Selected</AlertTitle>
            <AlertDescription>Please select a company from the dropdown in the sidebar to manage its tax settings.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Tax Settings</CardTitle>
          <CardDescription>
            Manage statutory tax rates, contributions, and limits for the selected company.
            Changes saved here will persist in Supabase. Default values are from <code>src/lib/taxConfig.ts</code>. All monetary values are in RWF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {renderFeedbackMessage()}
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">Pay As You Earn (PAYE)</h3>
            <p className="text-xs text-muted-foreground">
                Band 1: Income up to {settings.payeBand1Limit} @ {settings.payeRate1}%<br/>
                Band 2: Income from {Number(settings.payeBand1Limit) + 1} to {settings.payeBand2Limit} @ {settings.payeRate2}%<br/>
                Band 3: Income from {Number(settings.payeBand2Limit) + 1} to {settings.payeBand3Limit} @ {settings.payeRate3}%<br/>
                Band 4: Income above {settings.payeBand3Limit} @ {settings.payeRate4}%
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div className="space-y-2">
                    <Label>Limits (RWF)</Label>
                    <Input type="number" name="payeBand1Limit" value={settings.payeBand1Limit || ""} onChange={handleInputChange} placeholder="Band 1 Limit (e.g., 60000)" />
                    <Input type="number" name="payeBand2Limit" value={settings.payeBand2Limit || ""} onChange={handleInputChange} placeholder="Band 2 Limit (e.g., 100000)" />
                    <Input type="number" name="payeBand3Limit" value={settings.payeBand3Limit || ""} onChange={handleInputChange} placeholder="Band 3 Limit (e.g., 200000)" />
                </div>
                <div className="space-y-2">
                    <Label>Rates (%)</Label>
                    <Input type="number" name="payeRate1" value={settings.payeRate1 || ""} onChange={handleInputChange} placeholder="Rate 1 (e.g., 0)" />
                    <Input type="number" name="payeRate2" value={settings.payeRate2 || ""} onChange={handleInputChange} placeholder="Rate 2 (e.g., 10)" />
                    <Input type="number" name="payeRate3" value={settings.payeRate3 || ""} onChange={handleInputChange} placeholder="Rate 3 (e.g., 20)" />
                    <Input type="number" name="payeRate4" value={settings.payeRate4 || ""} onChange={handleInputChange} placeholder="Rate 4 (e.g., 30)" />
                </div>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">Pension Contribution (%)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pensionEmployerRate">Employer Rate</Label>
                <Input id="pensionEmployerRate" name="pensionEmployerRate" type="number" step="0.01" value={settings.pensionEmployerRate || ""} onChange={handleInputChange} placeholder="e.g., 8"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pensionEmployeeRate">Employee Rate</Label>
                <Input id="pensionEmployeeRate" name="pensionEmployeeRate" type="number" step="0.01" value={settings.pensionEmployeeRate || ""} onChange={handleInputChange} placeholder="e.g., 6"/>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">Maternity Contribution (%)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maternityEmployerRate">Employer Rate</Label>
                <Input id="maternityEmployerRate" name="maternityEmployerRate" type="number" step="0.01" value={settings.maternityEmployerRate || ""} onChange={handleInputChange} placeholder="e.g., 0.3"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maternityEmployeeRate">Employee Rate</Label>
                <Input id="maternityEmployeeRate" name="maternityEmployeeRate" type="number" step="0.01" value={settings.maternityEmployeeRate || ""} onChange={handleInputChange} placeholder="e.g., 0.3"/>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">RAMA Contribution (%)</h3>
            <p className="text-xs text-muted-foreground">Contribution for medical insurance, calculated on basic salary.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ramaEmployerRate">Employer Rate</Label>
                <Input id="ramaEmployerRate" name="ramaEmployerRate" type="number" step="0.01" value={settings.ramaEmployerRate || ""} onChange={handleInputChange} placeholder="e.g., 7.5"/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ramaEmployeeRate">Employee Rate</Label>
                <Input id="ramaEmployeeRate" name="ramaEmployeeRate" type="number" step="0.01" value={settings.ramaEmployeeRate || ""} onChange={handleInputChange} placeholder="e.g., 7.5"/>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">Community-Based Health Insurance (CBHI) (%)</h3>
            <div className="space-y-2">
              <Label htmlFor="cbhiRate">Rate (on Net Pay Before CBHI)</Label>
              <Input id="cbhiRate" name="cbhiRate" type="number" step="0.01" value={settings.cbhiRate || ""} onChange={handleInputChange} placeholder="e.g., 0.5"/>
            </div>
          </div>

        </CardContent>
        <CardFooter>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" /> Save Tax Settings
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
