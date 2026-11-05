module.exports = function handler(req,res){
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="GET"){res.setHeader("Allow","GET");return res.status(405).json({error:"Method not allowed"})}
 const configured=Boolean(process.env.PROTOTYPE_ACCESS_CODE&&(process.env.OPENAI_API_KEY||process.env.VERCEL_OIDC_TOKEN||process.env.AI_GATEWAY_API_KEY));
 return res.status(200).json({aiConfigured:configured,accessCodeRequired:true,prototype:true,images:true,audio:false});
};