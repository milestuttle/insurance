const insuranceData = [
  {
    carrier: "CEBT",
    planName: "PPO4",
    premiums: {
      eeOnly: "$965",
      eeSpouse: "$1,931",
      eeChild: "$1,645",
      family: "$2,483"
    },
    coverage: {
      officeVisit: "$40",
      specialist: "$40",
      inpatient: "Ded + 20%",
      outpatient: "Ded + 20%",
      urgentCare: "$75",
      deductible: "$1500/$3000",
      maxOop: "$4000/$8000",
      coinsurance: "20%",
      prescriptions: "$20/$40/$60"
    }
  },
  {
    carrier: "CEBT",
    planName: "PPO7",
    premiums: {
      eeOnly: "$811",
      eeSpouse: "$1,621",
      eeChild: "$1,380",
      family: "$2,084"
    },
    coverage: {
      officeVisit: "$55",
      specialist: "$55",
      inpatient: "Ded + 20%",
      outpatient: "Ded + 20%",
      urgentCare: "$75",
      deductible: "$4000/$8000",
      maxOop: "$5000/$10000",
      coinsurance: "20%",
      prescriptions: "$20/$40/$60"
    }
  },
  {
    carrier: "CEBT",
    planName: "PPO9",
    premiums: {
      eeOnly: "$740",
      eeSpouse: "$1,479",
      eeChild: "$1,259",
      family: "$1,901"
    },
    coverage: {
      officeVisit: "$65",
      specialist: "$65",
      inpatient: "Ded + 0%",
      outpatient: "Ded + 0%",
      urgentCare: "$75",
      deductible: "$6000/$12000",
      maxOop: "$6000/$12000",
      coinsurance: "0%",
      prescriptions: "$20/$40/$60"
    }
  },
  {
    carrier: "CEC",
    planName: "HSA6000 1700/3420",
    premiums: {
      eeOnly: "$753.00",
      eeSpouse: "$1,505.00",
      eeChild: "$1,281.00",
      family: "$1,934.00"
    },
    coverage: {
      officeVisit: "$30",
      specialist: "$50",
      inpatient: "Ded + 50%",
      outpatient: "Ded + 50%",
      urgentCare: "$75",
      deductible: "$1700/$3400",
      maxOop: "$3,420/$6,840",
      coinsurance: "60%",
      prescriptions: "$0/$75/$100"
    }
  },
  {
    carrier: "CEC",
    planName: "HSA6000 1700/3850",
    premiums: {
      eeOnly: "$737.00",
      eeSpouse: "$1,472.00",
      eeChild: "$1,253.00",
      family: "$1,892.00"
    },
    coverage: {
      officeVisit: "$30",
      specialist: "$50",
      inpatient: "Ded + 50%",
      outpatient: "Ded + 50%",
      urgentCare: "$75",
      deductible: "$1700/$3400",
      maxOop: "$3,850/$7,700",
      coinsurance: "50%",
      prescriptions: "$0/$75/$100"
    }
  },
  {
    carrier: "CEC",
    planName: "HSA6000 6000/6000",
    premiums: {
      eeOnly: "$675.00",
      eeSpouse: "$1,349.00",
      eeChild: "$1,148.00",
      family: "$1,734.00"
    },
    coverage: {
      officeVisit: "$30",
      specialist: "$50",
      inpatient: "Ded + 50%",
      outpatient: "Ded + 50%",
      urgentCare: "$75",
      deductible: "$6,000/$12,000",
      maxOop: "$6,000/$12,000",
      coinsurance: "100%",
      prescriptions: "$0/$75/$100"
    }
  },
  {
    carrier: "CEC",
    planName: "Simplicity 1000/1000",
    premiums: {
      eeOnly: "$909.00",
      eeSpouse: "$1,817.00",
      eeChild: "$1,546.00",
      family: "$2,335.00"
    },
    coverage: {
      officeVisit: "$0",
      specialist: "$0",
      inpatient: "Ded + 50%",
      outpatient: "Ded + 50%",
      urgentCare: "$0",
      deductible: "$1,000/$2,000",
      maxOop: "$2,000/$2,000",
      coinsurance: "50%",
      prescriptions: "$0/$75/$100"
    }
  },
  {
    carrier: "CEC",
    planName: "Simplicity 1000/3000",
    premiums: {
      eeOnly: "$849.00",
      eeSpouse: "$1,699.00",
      eeChild: "$1,447.00",
      family: "$2,184.00"
    },
    coverage: {
      officeVisit: "$0",
      specialist: "$0",
      inpatient: "Ded + 50%",
      outpatient: "Ded + 50%",
      urgentCare: "$0",
      deductible: "$1,000/$2,000",
      maxOop: "$3,000/$6,000",
      coinsurance: "50%",
      prescriptions: "$0/$75/$100"
    }
  },
  {
    carrier: "CEC",
    planName: "Simplicity 1000/5000",
    premiums: {
      eeOnly: "$713.00",
      eeSpouse: "$1,426.00",
      eeChild: "$1,214.00",
      family: "$1,833.00"
    },
    coverage: {
      officeVisit: "$0",
      specialist: "$0",
      inpatient: "Ded + 50%",
      outpatient: "Ded + 50%",
      urgentCare: "$0",
      deductible: "$1,000/$2,000",
      maxOop: "$5,000/$10,000",
      coinsurance: "50%",
      prescriptions: "$0/$75/$100"
    }
  },
  {
    carrier: "CEC",
    planName: "Traditional 1500/1500",
    premiums: {
      eeOnly: "$883.00",
      eeSpouse: "$1,764.00",
      eeChild: "$1,501.00",
      family: "$2,267.00"
    },
    coverage: {
      officeVisit: "$30",
      specialist: "$50",
      inpatient: "Ded + 50%",
      outpatient: "Ded + 50%",
      urgentCare: "$75",
      deductible: "$1,500/$3,000",
      maxOop: "$1,500/$3,000",
      coinsurance: "30%",
      prescriptions: "$0/$75/$100"
    }
  },
  {
    carrier: "CEC",
    planName: "Traditional 2500/2500",
    premiums: {
      eeOnly: "$824.00",
      eeSpouse: "$1,647.00",
      eeChild: "$1,402.00",
      family: "$2,117.00"
    },
    coverage: {
      officeVisit: "$30",
      specialist: "$50",
      inpatient: "Ded + 50%",
      outpatient: "Ded + 50%",
      urgentCare: "$75",
      deductible: "$2,500/$5,000",
      maxOop: "$2,500/$5,000",
      coinsurance: "30%",
      prescriptions: "$0/$75/$100"
    }
  },
  {
    carrier: "CEC",
    planName: "Traditional 5000/5000",
    premiums: {
      eeOnly: "$595.00",
      eeSpouse: "$1,190.00",
      eeChild: "$1,071.00",
      family: "$1,725.00"
    },
    coverage: {
      officeVisit: "$30",
      specialist: "$50",
      inpatient: "Ded + 50%",
      outpatient: "Ded + 50%",
      urgentCare: "$75",
      deductible: "$5,000/$10,000",
      maxOop: "$5,000/$10,000",
      coinsurance: "30%",
      prescriptions: "$0/$75/$100"
    }
  },
  {
    carrier: "PERACare",
    planName: "Kaiser EDCP",
    premiums: {
      eeOnly: "$843.00",
      eeSpouse: "$1,679.00",
      eeChild: "$1,554.00",
      family: "$2,426.00"
    },
    coverage: {
      officeVisit: "$0",
      specialist: "$0",
      inpatient: "Ded + 0%",
      outpatient: "$500 copay / 0%",
      urgentCare: "$0",
      deductible: "$4,000/$8,000",
      maxOop: "$4,000/$8,000",
      coinsurance: "20%",
      prescriptions: "$0/$50/$125"
    }
  },
  {
    carrier: "PERACare",
    planName: "Kaiser HDHP",
    premiums: {
      eeOnly: "$521.00",
      eeSpouse: "$1,034.00",
      eeChild: "$957.00",
      family: "$1,493.00"
    },
    coverage: {
      officeVisit: "20%",
      specialist: "20%",
      inpatient: "Ded + 20%",
      outpatient: "Ded + 10% / 20%",
      urgentCare: "20%",
      deductible: "$3,500/$7,000",
      maxOop: "$6,050/$12,100",
      coinsurance: "20%",
      prescriptions: "$10/$50/50%"
    }
  }
];

export default insuranceData;
