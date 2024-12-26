import { GoogleGenerativeAI } from '@google/generative-ai';

// تهيئة Gemini API مع المفتاح
let genAI;
try {
  const API_KEY = 'AIzaSyA2M0cFvrArjZApvo1O07bBMwxR8SuywTA';
  genAI = new GoogleGenerativeAI(API_KEY);
} catch (error) {
  console.error('Error initializing Gemini API:', error);
}

// دالة لمعالجة النص
export async function processText(text) {
  try {
    if (!genAI) {
      throw new Error('لم يتم تهيئة Gemini API بشكل صحيح');
    }

    // استخدام النموذج الجديد gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyze and solve the following mathematical expression:
      ${text}

      Provide the solution in the following format:

      Expression: ${text}
      Solution:
      1. [First step]
      2. [Second step]
      ...
      Final Answer: [Write the final result]

      Additional Tips:
      - [Provide any relevant tips or explanations]
    `;
    
    console.log('Sending request to Gemini API...');
    
    const result = await model.generateContent(prompt);
    console.log('Received response from Gemini API');
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Text Processing Error:', error);
    throw new Error('حدث خطأ في معالجة المسألة. الرجاء المحاولة مرة أخرى.');
  }
}

export async function processImage(imageFile) {
  try {
    if (!genAI) {
      throw new Error('لم يتم تهيئة Gemini API بشكل صحيح');
    }

    // استخدام النموذج الجديد gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // تحويل الصورة إلى صيغة Base64
    const imageData = await fileToGenerativePart(imageFile);
    
    const prompt = `
      You are a math expert assistant. Please:
      1. Identify the mathematical expression in the image
      2. Solve it step by step
      3. Provide the final answer
      
      Format your response in Arabic as follows:
      المسألة: [المسألة المكتشفة]
      خطوات الحل:
      1. [الخطوة الأولى]
      2. [الخطوة الثانية]
      ...
      الإجابة النهائية: [النتيجة]
    `;

    console.log('Sending request to Gemini API with new model...');
    
    const result = await model.generateContent([prompt, imageData]);
    console.log('Received response from Gemini API');
    
    const response = await result.response;
    if (!response || !response.text()) {
      throw new Error('لم يتم التعرف على المسألة. الرجاء التأكد من وضوح الصورة.');
    }
    
    return response.text();
  } catch (error) {
    console.error('Error processing image:', error);
    
    // رسائل خطأ أكثر تفصيلاً
    if (error.message.includes('API key')) {
      throw new Error('خطأ في مفتاح API. الرجاء التحقق من الإعدادات.');
    } else if (error.message.includes('network')) {
      throw new Error('خطأ في الاتصال بالشبكة. الرجاء التحقق من اتصال الإنترنت.');
    } else if (error.message.includes('format')) {
      throw new Error('صيغة الصورة غير مدعومة. الرجاء استخدام صور بصيغة JPG أو PNG.');
    } else if (error.message.includes('deprecated')) {
      throw new Error('تم تحديث نموذج Gemini. جاري استخدام النموذج الجديد...');
    } else {
      throw new Error('حدث خطأ في معالجة الصورة: ' + error.message);
    }
  }
}

async function fileToGenerativePart(file) {
  // التحقق من حجم الملف (أقل من 4MB)
  if (file.size > 4 * 1024 * 1024) {
    throw new Error('حجم الصورة كبير جداً. الرجاء استخدام صورة أصغر من 4MB.');
  }

  // التحقق من نوع الملف
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('صيغة الصورة غير مدعومة. الرجاء استخدام صور بصيغة JPG أو PNG.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      try {
        const base64Data = reader.result.split(',')[1];
        resolve({
          inlineData: { 
            data: base64Data, 
            mimeType: file.type 
          }
        });
      } catch (error) {
        reject(new Error('خطأ في قراءة الصورة. الرجاء المحاولة مرة أخرى.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('خطأ في قراءة الصورة. الرجاء المحاولة مرة أخرى.'));
    };

    reader.readAsDataURL(file);
  });
}
