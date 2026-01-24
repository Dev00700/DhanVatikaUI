import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FooterComponent } from '../shared/footer/footer.component';
import { PlotBookingReqDto } from '../../models/plotbooking.model';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { CommonReqDto } from '../../models/common.model';
import { firstValueFrom, Subscription } from 'rxjs';

@Component({
  selector: 'app-create-plot-booking',
  imports: [CommonModule, NavbarComponent, FormsModule, RouterModule, FooterComponent],
  templateUrl: './create-plot-booking.component.html',
  styleUrl: './create-plot-booking.component.css'
})
export class CreatePlotBookingComponent {
  addplotbookingreq: any = {};//PlotBookingReqDto = {} as PlotBookingReqDto;
  loading = false;
  fullpageloader = false;
  plotBookingGuid: string | null = null;
  isActiveDisabled = true;
  filesMap: Record<string, File | null> = {
    panCardImage: null,
    drivinglicenceImage: null,
    passportimage: null,
    voterIdImage: null,
    adharImage: null,
    rationcardImage: null,
    executiveSignature: null,
    purchaserSign: null,
    directorSign: null,
    authorizedSignatory: null
  };

  previews: Record<string, { url: string; type: 'pdf' | 'image' } | null> = {
    panCardImage: null,
    drivinglicenceImage: null,
    passportimage: null,
    voterIdImage: null,
    adharImage: null,
    rationcardImage: null,
    executiveSignature: null,
    purchaserSign: null,
    directorSign: null,
    authorizedSignatory: null
  };
  plotId?: number;
  customerId?: number;
  private sub?: Subscription;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private toast: ToastService,) {
    this.route.queryParams.subscribe(params => {
      const plotId = params['plotId'];
      const customerId = params['customerId'];
      if (plotId) {
        this.plotId = +plotId;
        this.customerId = customerId;
        this.loadCustomerPlotDetails();
      }
    });
  }
  ngOnInit() { }

  onFileChange(ev: Event, key: string): void {
    const input = ev.target as HTMLInputElement;
    if (!input) return;

    // clear previous preview/objectURL if any
    const prev = this.previews[key];
    if (prev && prev.type === 'pdf' && prev.url) {
      try { URL.revokeObjectURL(prev.url); } catch { /* ignore */ }
    }
    this.previews[key] = null;
    this.filesMap[key] = null;

    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const fileType = (file.type || '').toLowerCase();
    const fileName = file.name || '';
    const ext = (fileName.split('.').pop() || '').toLowerCase();

    const isImage = fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext);
    const isPdf = fileType === 'application/pdf' || ext === 'pdf';

    // fields that should accept only images (update list if needed)
    const imageOnlyKeys = new Set([
      'executiveSignature',
      'purchaserSign',
      'authorizedSignatory',
      'directorSign'
    ]);

    // If PDF selected for an image-only field -> reject and show warning
    if (isPdf && imageOnlyKeys.has(key)) {
      this.toast.warning('Please upload an image file (jpg/png) for this field.');
      // ensure input cleared so user can re-select
      input.value = '';
      this.filesMap[key] = null;
      this.previews[key] = null;
      return;
    }

    // Accept only image or pdf for other fields; reject unknown types
    if (!isImage && !isPdf) {
      this.toast.warning('Unsupported file type. Please upload image or PDF.');
      input.value = '';
      return;
    }

    // store file
    this.filesMap[key] = file;

    // create preview
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previews[key] = { url: String(reader.result), type: 'image' };
      };
      reader.readAsDataURL(file);
    } else if (isPdf) {
      const url = URL.createObjectURL(file);
      this.previews[key] = { url, type: 'pdf' };
    }

    // optional debug
    console.log(`File selected for ${key}:`, file.name, isImage ? 'image' : (isPdf ? 'pdf' : 'other'));
  }

  validateMandatory(): string[] {
    const missing: string[] = [];
    const required = [
      { k: 'customerName', label: 'Customer Name' },
      { k: 'bookingDate', label: 'Booking Date' },
      { k: 'occupation', label: 'Occupation' },
      { k: 'dateOfBirth', label: 'Date Of Birth' },
      { k: 'contactNo1', label: 'Mobile No.' },
      { k: 'postalAddress', label: 'Postal Address' },
      { k: 'emailAddress', label: 'Email Address' },
      { k: 'state', label: 'State' },
      { k: 'city', label: 'City' },
      { k: 'pinCode', label: 'PinCode' },
      // { k: 'referenceName1', label: 'Name 1 in Reference Tab' },
      // { k: 'referenceContact1', label: 'Contact No 1  in Reference Tab' },
      // { k: 'referenceName2', label: 'Name 2  in Reference Tab' },
      // { k: 'referenceContact2', label: 'Contact No. 2  in Reference Tab' },
      { k: 'nomineeName', label: 'Nominee Name' },
      { k: 'nomineeAddress', label: 'Nominee Address' },
      { k: 'nomineePhoneNo', label: 'Nominee Phone No' },
      { k: 'nomineeRelation', label: 'Nominee Relation' },
      { k: 'nomineeAge', label: 'Nominee Age' },
      { k: 'block', label: 'Block -Project Tab' },
      { k: 'plotCity', label: 'City  -Project Tab' },
      { k: 'khasraNo', label: 'Khasra No. -Project Tab' },

      { k: 'plotSize', label: 'Size  -Project Tab' },
      { k: 'ratePerSqFt', label: 'Rate (Per Square Feet)  -Project Tab' },
      { k: 'panCardNumber', label: 'Pan Card Number' },
      { k: 'aadhaarNumber', label: 'Adhar Card Number' },
    ];
    required.forEach(r => {
      const v = this.addplotbookingreq[r.k];
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        missing.push(r.label);
      }
    });

    const remaining = this.addplotbookingreq.remainingAmount || 0;
    if (remaining > 0) {
      const numInstallments = this.addplotbookingreq.numberOfInstallments;
      if (numInstallments === undefined || numInstallments === null || numInstallments === '' || numInstallments <= 0) {
        missing.push('Number of Installments (required when remaining amount > 0)');
      }
    }
    const formatErrors: string[] = [];

    if (this.addplotbookingreq.contactNo1 && !this.isValidMobileNo(this.addplotbookingreq.contactNo1)) {
      formatErrors.push('Mobile No must be 10 digits and start with 6-9.');
    }

    if (this.addplotbookingreq.contactNo2 && !this.isValidMobileNo(this.addplotbookingreq.contactNo2)) {
      formatErrors.push('Mobile No 2 must be 10 digits and start with 6-9.');
    }

    if (this.addplotbookingreq.emailAddress && !this.isValidEmail(this.addplotbookingreq.emailAddress)) {
      formatErrors.push('Email Address format is invalid.');
    }

    if (this.addplotbookingreq.pinCode && !this.isValidPinCode(this.addplotbookingreq.pinCode)) {
      formatErrors.push('Pin Code must be 6 digits.');
    }

    if (this.addplotbookingreq.panCardNumber && !this.isValidPAN(this.addplotbookingreq.panCardNumber)) {
      formatErrors.push('PAN Card format is invalid (e.g., AAAPA5055K).');
    }

    if (this.addplotbookingreq.aadhaarNumber && !this.isValidAadhaar(this.addplotbookingreq.aadhaarNumber)) {
      formatErrors.push('Aadhaar Number must be 12 digits.');
    }

    if (this.addplotbookingreq.nomineePhoneNo && !this.isValidMobileNo(this.addplotbookingreq.nomineePhoneNo)) {
      formatErrors.push('Nominee Phone No must be 10 digits and start with 6-9.');
    }

    if (this.addplotbookingreq.referenceContact1 && !this.isValidMobileNo(this.addplotbookingreq.referenceContact1)) {
      formatErrors.push('Reference Contact 1 must be 10 digits and start with 6-9.');
    }

    if (this.addplotbookingreq.referenceContact2 && !this.isValidMobileNo(this.addplotbookingreq.referenceContact2)) {
      formatErrors.push('Reference Contact 2 must be 10 digits and start with 6-9.');
    }

    const docErrors = this.validateDocumentPairs();
    return [...missing, ...formatErrors, ...docErrors];
  }


  computeTotalCost(): void {
    const toNumber = (v: any) => {
      if (v === undefined || v === null) return 0;
      if (typeof v === 'number') return v;
      const s = String(v).replace(/,/g, '').trim();
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const rate = toNumber(this.addplotbookingreq.ratePerSqFt);
    const area = toNumber(this.addplotbookingreq.areaSqFt);

    // const area = toNumber(this.addplotbookingreq.plotSize ?? this.addplotbookingreq.areaSqFt);
    const total = rate * area;

    this.addplotbookingreq.totalCost = Number.isFinite(total) ? +total.toFixed(2) : 0;
  }


  computeAllAmounts(): void {
    this.computeTotalCost();
    this.computeRemainingAmount();
    this.computeEMI();
  }
  computeRemainingAmount(): void {
    const toNumber = (v: any) => {
      if (v === undefined || v === null) return 0;
      if (typeof v === 'number') return v;
      const s = String(v).replace(/,/g, '').trim();
      if (s === '') return 0;
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const total = toNumber(this.addplotbookingreq.totalCost);
    const token = toNumber(this.addplotbookingreq.tokenAmount);
    const downPayment = toNumber(this.addplotbookingreq.downPaymentAmount);

    const remaining = total - token - downPayment;

    // ensure non-negative and round to 2 decimals
    this.addplotbookingreq.remainingAmount = remaining > 0 ? +remaining.toFixed(2) : 0;
  }

  computeEMI(): void {
    const toNumber = (v: any) => {
      if (v === undefined || v === null) return 0;
      if (typeof v === 'number') return v;
      const s = String(v).replace(/,/g, '').trim();
      if (s === '') return 0;
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const remaining = toNumber(this.addplotbookingreq.remainingAmount);
    const installments = toNumber(this.addplotbookingreq.numberOfInstallments);

    // if no installments or remaining is 0, EMI is 0
    if (installments <= 0 || remaining <= 0) {
      this.addplotbookingreq.emiAmount = 0;
      return;
    }

    const emi = remaining / installments;
    this.addplotbookingreq.emiAmount = Number.isFinite(emi) ? +emi.toFixed(2) : 0;
  }


  async onSubmit() {
    if (this.loading) return;
    this.computeAllAmounts();
    const missing = this.validateMandatory();
    if (missing.length) {
      this.toast.warning('Please fill mandatory fields: ' + missing.join(', '));
      return;
    }

    if (this.addplotbookingreq.ratePerSqFt <= 0) {
      this.toast.warning('Rate (Per Square Feet) must be greater than zero.');
      return;
    }



    this.loading = true;


    try {
      // If there are files selected, upload them first one-by-one and capture returned names
      const hasFiles = Object.values(this.filesMap).some(f => f);
      if (hasFiles) {
        await this.uploadAllFilesSequential();
      }

      // After uploads, build request body (JSON) and send to save API.
      // saveplotbooking() without FormData will send JSON payload.
      this.sub = this.saveplotbooking().subscribe({
        next: () => {
          this.loading = false;
          this.toast.success('Plot booking saved successfully.');
          this.router.navigate(['/customer-list']);
        },
        error: (err) => {
          console.error(err);
          this.loading = false;

          this.toast.error('Error saving plot booking. Please try again.');
        }
      });
    } catch (err) {
      console.error('File upload error', err);
      this.loading = false;
      this.toast.error('File upload failed. Please try again.');
    }



  }

  ngOnDestroy(): void {
    Object.keys(this.previews).forEach(k => {
      const p = this.previews[k];
      if (p && p.type === 'pdf' && p.url) {
        URL.revokeObjectURL(p.url);
      }
    });
    this.sub?.unsubscribe();
  }


  saveplotbooking(formData?: FormData) {
    this.addplotbookingreq.isActive = true;
    this.addplotbookingreq.remarks = this.addplotbookingreq.remarks || "";
    this.addplotbookingreq.bookingGuid = this.plotBookingGuid || null;
    this.addplotbookingreq.tokenAmount = this.addplotbookingreq.tokenAmount || 0;
    this.addplotbookingreq.emiAmount = this.addplotbookingreq.remainingAmount || 0;
    this.addplotbookingreq.plotSize = "";
    this.addplotbookingreq.referenceName1 = this.addplotbookingreq.referenceName1 || "";
    this.addplotbookingreq.referenceContact1 = this.addplotbookingreq.referenceContact1 || "";
    this.addplotbookingreq.referenceName2 = this.addplotbookingreq.referenceName2 || "";
    this.addplotbookingreq.referenceContact2 = this.addplotbookingreq.referenceContact2 || "";
    this.addplotbookingreq.plotNo = this.addplotbookingreq.plotNo || "";
    const reqBody: CommonReqDto<PlotBookingReqDto> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: this.addplotbookingreq
    };

    const apiUrl = this.plotBookingGuid
      ? 'Plot/UpdatePlotBookingService'
      : 'Plot/AddPlotBookingService';

    this.loading = true;

    // If a FormData is provided (files + fields), send that. Otherwise send JSON body.
    // ApiService.post should be able to handle FormData; if not, add a dedicated method in ApiService.
    if (formData) {
      return this.apiService.post<any>(apiUrl, reqBody);
    } else {
      return this.apiService.post<any>(apiUrl, reqBody);
    }
  }


  loadCustomerPlotDetails() {
    if (!this.plotId || !this.customerId) return;
    this.fullpageloader = true;
    const apiUrl = `Customer/PlotWiseCustomerPaymentListService`;
    const reqBody: CommonReqDto<any> = {
      UserId: parseInt(localStorage.getItem("userId") || '0', 10),
      PageSize: 1,
      PageRecordCount: 1000,
      Data: {
        "PlotId": this.plotId,
        "CustomerId": this.customerId
      }
    };

    this.apiService.post<any>(apiUrl, reqBody).subscribe({
      next: (response) => {
        this.fullpageloader = false;
        if (response.data) {
          console.log(response.data);

          this.addplotbookingreq.customerName = response.data[0].customerName || "";
          this.addplotbookingreq.purchaserName = response.data[0].customerName || "";
          const d = new Date(response.data[0].createdOn);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');

          const formatted = `${year}-${month}-${day}`;
          this.addplotbookingreq.bookingDate = formatted;
          this.addplotbookingreq.contactNo1 = response.data[0].mobile || "";
          this.addplotbookingreq.emailAddress = response.data[0].emailId || "";
          this.addplotbookingreq.projectName = response.data[0].plotName || "";
          this.addplotbookingreq.areaSqFt = response.data[0].areaSize || "";
          this.addplotbookingreq.tokenAmount = response.data[0].amount || "";
          this.addplotbookingreq.plotId = this.plotId;
          this.addplotbookingreq.customerId = this.customerId;
          this.addplotbookingreq.plotSize = response.data[0].areaSize || "";
          // Populate other fields as needed
        } else {
          this.toast.warning('No details found for the selected customer and plot.');
        }
      },
      error: (error) => {
        this.fullpageloader = false;
        this.toast.error('Failed to load customer and plot details.');
      }
    });
  }

  private async uploadAllFilesSequential(): Promise<void> {
    console.log(this.filesMap);
    for (const key of Object.keys(this.filesMap)) {
      const file = this.filesMap[key];
      if (!file) continue;

      try {
        const savedName = await this.uploadFileAndGetName(file);
        debugger;
        console.log(savedName);
        if (savedName) {
          // store the returned filename in payload so save API knows saved file names
          this.addplotbookingreq[`${key}`] = savedName;
        } else {
          // if backend returned nothing, fallback to original file name
          this.addplotbookingreq[`${key}`] = file.name;
        }
      } catch (err) {
        // bubble up error so caller can stop submission
        throw err;
      }
    }
  }

  private async uploadFileAndGetName(file: File): Promise<string> {
    const form = new FormData();
    // backend expects 'images' for multiple; single upload keep same key
    form.append('images', file);

    const apiUrl = 'IncommingPayment/UploadPaymentImages'; // adjust if different

    try {
      const res: any = await firstValueFrom(this.apiService.post<any>(apiUrl, form));
      // try to extract filename from common response shapes
      if (!res) return '';

      // if res.data is array of uploaded items
      if (Array.isArray(res.data) && res.data.length > 0) {
        const it = res.data[0];
        return (typeof it === 'string') ? it : (it.image || it.fileName || it.name || '');
      }

      // if res.data is single object or string
      if (typeof res.data === 'string') return res.data;
      if (res.data && typeof res.data === 'object') return res.data.image || res.data.fileName || res.data.name || '';

      // fallback fields
      return res.fileName || res.file || res.name || '';
    } catch (err) {
      console.error('Upload failed', err);
      throw err;
    }
  }


  // ...existing code...

  isValidAadhaar(aadhaarNumber: string): boolean {
    if (!aadhaarNumber) return false;

    // Convert to string if not already
    const aadhaarStr = String(aadhaarNumber).trim();

    // Aadhaar must be exactly 12 digits
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaarStr);
  }

  isValidPAN(panNumber: string): boolean {
    if (!panNumber) return false;
    const panStr = String(panNumber).trim().toUpperCase();
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(panStr);
  }

  isValidMobileNo(mobileNo: string): boolean {
    if (!mobileNo) return false;
    const mobileStr = String(mobileNo).trim();
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobileStr);
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailStr = String(email).trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  }

  isValidPinCode(pinCode: string): boolean {
    if (!pinCode) return false;
    const pinStr = String(pinCode).trim();
    const pinRegex = /^\d{6}$/;
    return pinRegex.test(pinStr);
  }
  onAadhaarInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^\d]/g, '');
    if (input.value.length > 12) {
      input.value = input.value.substring(0, 12);
    }
    this.addplotbookingreq.aadhaarNumber = input.value;
  }

  onPinCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^\d]/g, '');
    if (input.value.length > 6) {
      input.value = input.value.substring(0, 6);
    }
    this.addplotbookingreq.pinCode = input.value;
  }
  onMobileInput(event: Event, type: string): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^\d]/g, '');
    if (input.value.length > 10) {
      input.value = input.value.substring(0, 10);
    }
    if (type === 'contactNo1') {
      this.addplotbookingreq.contactNo1 = input.value;
    }
    if (type === 'contactNo2') {
      this.addplotbookingreq.contactNo2 = input.value;
    }
    if (type === 'referenceContact1') {
      this.addplotbookingreq.referenceContact1 = input.value;
    }
    if (type === 'referenceContact2') {
      this.addplotbookingreq.referenceContact2 = input.value;
    }
    if (type === 'nomineePhoneNo') {
      this.addplotbookingreq.nomineePhoneNo = input.value;
    }
  }

  validateDocumentPairs(): string[] {
    const docPairs = [
      { numberKey: 'panCardNumber', imageKey: 'panCardImage', label: 'panCardImage Card' },
      { numberKey: 'drivingLicenseNumber', imageKey: 'drivingLicenseImage', label: 'Driving License' },
      { numberKey: 'passportNumber', imageKey: 'passportImage', label: 'Passport' },
      { numberKey: 'voterIdNumber', imageKey: 'voterIdImage', label: 'Voter ID' },
      { numberKey: 'aadhaarNumber', imageKey: 'aadhaarImage', label: 'Aadhaar' },
      { numberKey: 'rationCardNumber', imageKey: 'rationCardImage', label: 'Ration Card' }
    ];

    const errors: string[] = [];

    docPairs.forEach(pair => {
      const numberValue = this.addplotbookingreq[pair.numberKey];
      const imageFile = this.filesMap[pair.imageKey];
      const hasNumber = numberValue && String(numberValue).trim() !== '';
      const hasImage = !!imageFile;

      // If number entered but no image
      if (hasNumber && !hasImage) {
        errors.push(`${pair.label}: Image is mandatory when document number is provided.`);
      }

      // If image uploaded but no number
      if (hasImage && !hasNumber) {
        errors.push(`${pair.label}: Document number is mandatory when image is uploaded.`);
      }
    });

    return errors;
  }

  isNumberOfInstallmentsDisabled(): boolean {
    const remaining = this.addplotbookingreq.remainingAmount || 0;
    return remaining <= 0;
  }

}


