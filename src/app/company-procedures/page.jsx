'use client';

import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import ComingSoon from '@/components/common/ComingSoon';

const CompanyProceduresPage = () => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <DashboardLayout>
      <ComingSoon 
        title="Şirkət Prosedurları"
        description="Şirkət prosedurları və iş qaydaları modulu hazırlanır"
      />
    </DashboardLayout>
  );
};

export default CompanyProceduresPage;