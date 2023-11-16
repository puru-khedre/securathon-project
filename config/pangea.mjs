import {
  PangeaConfig,
  VaultService,
  Vault,
  URLIntelService,
  DomainIntelService,
} from "pangea-node-sdk";

const vaultToken = process.env.PANGEA_VAULT_TOKEN;
const urlIntelToken = process.env.PANGEA__URL_INTEL_TOKEN;
const domainToken = process.env.PANGEA_DOMAIN_INTEL_TOKEN;
const config = new PangeaConfig({ domain: process.env.PANGEA_DOMAIN });

const vault = new VaultService(vaultToken, config);
const urlIntel = new URLIntelService(urlIntelToken, config);
const domainIntel = new DomainIntelService(domainToken, config);

export default { vault, Vault, urlIntel, domainIntel };
