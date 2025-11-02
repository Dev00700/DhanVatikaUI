import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class numbertowords {
    convertNumberToWordsIndian(num: number): string {
        if (num === 0) return 'zero';

        const a = [
            '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
            'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
            'seventeen', 'eighteen', 'nineteen'
        ];
        const b = [
            '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
        ];

        const make2 = (n: number) => n < 20 ? a[n] : b[Math.floor(n / 10)] + (n % 10 ? '-' + a[n % 10] : '');

        let str = '';
        if (num >= 10000000) {
            str += make2(Math.floor(num / 10000000)) + ' crore ';
            num %= 10000000;
        }
        if (num >= 100000) {
            str += make2(Math.floor(num / 100000)) + ' lakh ';
            num %= 100000;
        }
        if (num >= 1000) {
            str += make2(Math.floor(num / 1000)) + ' thousand ';
            num %= 1000;
        }
        if (num >= 100) {
            str += make2(Math.floor(num / 100)) + ' hundred ';
            num %= 100;
        }
        if (num > 0) {
            if (str !== '') str += 'and ';
            str += make2(num);
        }
        return str.trim();
    }
}