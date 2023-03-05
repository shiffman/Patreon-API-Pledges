import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';

dotenv.config();

const clientId = process.env.PATREON_CLIENT_ID;
const clientSecret = process.env.PATREON_CLIENT_SECRET;
const accessToken = process.env.CREATOR_ACCESS_TOKEN;

const apiUrl = 'https://www.patreon.com/api/oauth2/api';

async function getPatrons(url) {
  let nextPage = url;

  const patrons = {
    data: [],
    included: [],
  };

  while (nextPage) {
    const pledgesRes = await axios.get(nextPage, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Patreon Test App',
      },
    });
    const newPatrons = pledgesRes.data;
    patrons.data.push(...newPatrons.data);
    patrons.included.push(...newPatrons.included);
    nextPage = pledgesRes.data.links.next;
    console.log(`${patrons.data.length} patrons`);
  }
  return patrons;
}

async function getCampaignId() {
  const campaignsRes = await axios.get(`${apiUrl}/current_user/campaigns`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': 'Patreon Test App',
    },
  });
  return campaignsRes.data.data[0].id;
}

async function go() {
  const campaignId = await getCampaignId();
  console.log(`Campaign ID: ${campaignId}`);
  const url = `${apiUrl}/campaigns/${campaignId}/pledges`;
  const patrons = await getPatrons(url);
  console.log('Writing out patrons.json');
  fs.writeFileSync('patrons.json', JSON.stringify(patrons, null, 2));
}

go();
