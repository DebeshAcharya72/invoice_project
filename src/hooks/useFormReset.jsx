// src/hooks/useFormReset.js
import { useNavigate } from "react-router-dom";

export const useFormReset = () => {
  const navigate = useNavigate();

  const getInitialPartyForm = () => ({
    party_name: "",
    address_line1: "",
    city: "",
    state: "",
    pin: "",
    contact_person: "",
    mobile_no: "",
    gst: "",
    customer_type: "Registered",
  });

  const getInitialPurchaseForm = () => ({
    party_name: "",
    purchased_from: "Party",
    agent_name: "",
    agent_number: "",
    invoice_no: "",
    date: new Date().toISOString().split("T")[0],
    received_date: "",
    product_name: "Boiled Rice Bran",
    contracted_rate: "",
    final_contracted_rate: "",
    bran_type: "Good",
    gross_weight_mt: "",
    no_of_bags: "",
    bag_type: "Poly",
    bag_weight_mt: "0.000200",
    net_weight_mt: "",
    billed_weight_mt: "",
  });

  const getInitialVehicleForm = () => ({
    vehicle_no: "",
    owner_name: "",
    owner_rc: "",
    owner_address_line1: "",
    owner_city: "",
    owner_state: "",
    owner_pin: "",
    mobile_no: "",
    bank_account: "",
    bank_name: "",
    ifsc: "",
    rice_mill_name: "",
    destination_from: "",
    destination_to: "",
    quantity_mt: "",
    freight_per_mt: "",
    advance_amount: "",
    paid_by: "Buyer",
  });

  const getInitialLabForm = () => ({
    standard_ffa: "7",
    standard_oil: "19",
    obtain_ffa: "",
    obtain_oil: "",
    ffa_rebate_rs: "",
    ffa_premium_rs: "",
    oil_rebate_rs: "",
    oil_premium_rs: "",
  });

  const getInitialBillingForm = () => ({
    gst_type: "Intra",
    invoice_amount: "",
  });

  const getInitialSavedSections = () => ({
    party: false,
    purchase: false,
    vehicle: false,
    lab: false,
    billing: false,
  });

  const getInitialModifiedSections = () => ({
    party: false,
    purchase: false,
    vehicle: false,
    lab: false,
    billing: false,
  });

  const resetForm = ({
    setPartyForm,
    setPurchaseForm,
    setVehicleForm,
    setLabForm,
    setBillingForm,
    setSavedSections,
    setModifiedSections,
    setSavedVehicleData,
    setSavedLabData,
    setSavedPurchaseData,
    setSavedPartyData,
    setSavedBillingData,
    setCurrentPurchaseId,
    setUsingExistingParty,
    setSelectedExistingParty,
    mode,
    loadParties,
    showSuccess,
    partyNameRef,
    currentUser,
    companies,
    setSelectedCompany,
    parties, // Add parties parameter
  }) => {
    console.log("Resetting form for new entry...");

    // Reset all form states
    setPartyForm(getInitialPartyForm());
    setPurchaseForm(getInitialPurchaseForm());
    setVehicleForm(getInitialVehicleForm());
    setLabForm(getInitialLabForm());
    setBillingForm(getInitialBillingForm());

    // Reset saved states
    setSavedSections(getInitialSavedSections());
    setModifiedSections(getInitialModifiedSections());

    // Clear saved data
    setSavedVehicleData(null);
    setSavedLabData(null);
    setSavedPurchaseData(null);
    setSavedPartyData(null);
    setSavedBillingData(null);

    // Reset current purchase ID
    setCurrentPurchaseId(null);

    // Reset existing party selection
    setUsingExistingParty(false);
    setSelectedExistingParty(null);

    // Navigate if in edit mode
    if (mode === "edit") {
      navigate("/home");
      return; // Return early to prevent further reset in edit mode
    }

    // Reset selected company
    if (currentUser?.company_id && companies && setSelectedCompany) {
      const userCompany = companies.find(
        (c) => (c._id || c.id) === currentUser.company_id,
      );
      if (userCompany) {
        setSelectedCompany(userCompany._id || userCompany.id);
      } else if (companies.length > 0) {
        setSelectedCompany(companies[0]._id || companies[0].id);
      }
    }

    // Load fresh party list and then set first party
    if (loadParties) {
      loadParties().then(() => {
        // We need to wait for parties to load, but we don't have access to parties here
        // Instead, we'll rely on the useEffect in Home.jsx to set the first party
        // The loadParties function in Home.jsx already sets the first party:
        // if (data.length > 0 && !purchaseForm.party_name && mode === "create") {
        //   setPurchaseForm(prev => ({ ...prev, party_name: data[0].party_name }));
        // }
      });
    }

    // Show success message
    if (showSuccess) {
      setTimeout(() => {
        showSuccess("Form reset! Ready for new entry.");
      }, 300);
    }

    // Focus on first field
    setTimeout(() => {
      if (partyNameRef && partyNameRef.current) {
        partyNameRef.current.focus();
      }
    }, 500);
  };

  return {
    getInitialPartyForm,
    getInitialPurchaseForm,
    getInitialVehicleForm,
    getInitialLabForm,
    getInitialBillingForm,
    getInitialSavedSections,
    getInitialModifiedSections,
    resetForm,
  };
};
