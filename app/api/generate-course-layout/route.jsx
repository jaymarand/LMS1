import { db } from '@/config/db';
import { coursesTable } from '@/config/schema';
import { auth, currentUser } from '@clerk/nextjs/server';
import {
    GoogleGenAI,
} from '@google/genai';
import OpenAI from 'openai';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';


const PROMPT = `Genrate Learning Course depends on following details. In which Make sure to add Course Name, 
Description,Course Banner Image Prompt Depends on Course Topics in 3d illustration.
  Chapter Name, , Topic under each chapters ,
   Duration for each chapters etc, in JSON format only

Schema:

{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "string",
    "includeVideo": "boolean",
    "noOfChapters": "number",
    "bannerImagePrompt": "string"
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": [
          "string"
        ],
       
      }
    ]
  }
}

, User Input: 

`
export const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
export async function POST(req) {
    const { courseId, ...formData } = await req.json();
    const user = await currentUser();
    const { has } = await auth()
    const hasPremiumAccess = has({ plan: 'starter' })
    const config = {
        responseMimeType: 'text/plain',

    };
    const model = 'gemini-2.0-flash';
    const contents = [
        {
            role: 'user',
            parts: [
                {
                    text: PROMPT + JSON.stringify(formData),
                },
            ],
        },
    ];

    //If user already created any course?
    if (!hasPremiumAccess) {
        const result = await db.select().from(coursesTable)
            .where(eq(coursesTable.userEmail, user?.primaryEmailAddress.emailAddress));

        if (result?.length >= 1) {
            return NextResponse.json({ 'resp': 'limit exceed' })
        }
    }

    const response = await ai.models.generateContent({
        model,
        config,
        contents,
    });

    console.log(response.candidates[0].content.parts[0].text);
    const RawResp = response?.candidates[0]?.content?.parts[0]?.text
    const RawJson = RawResp.replace('```json', '').replace('```', '');
    const JSONResp = JSON.parse(RawJson);

    const ImagePrompt = JSONResp.course?.bannerImagePrompt;

    //generate Image
    const bannerImageUrl = await GenerateImage(ImagePrompt)
    // Save to Database
    const result = await db.insert(coursesTable).values({
        ...formData,
        courseJson: JSONResp,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        cid: courseId,
        bannerImageUrl: bannerImageUrl
    });


    return NextResponse.json({ courseId: courseId });
}



const GenerateImage = async (imagePrompt) => {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Use OpenAI Images API to generate a 1024x1024 image from the prompt
    const resp = await client.images.generate({
        model: 'gpt-image-1',
        prompt: imagePrompt,
        size: '1024x1024',
        // response_format defaults to b64_json; we use that to keep Base64 storage behavior
    });
    const b64 = resp.data?.[0]?.b64_json;
    return b64 || '';
}

